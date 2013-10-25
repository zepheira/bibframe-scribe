var EditorCtrl = function($scope, $q, $modal, Configuration, Profiles, Subjects, Agents, Languages, Providers) {
    $scope.initialized = false;
    $scope.config = {};
    $scope.profiles = [];
    $scope.resourceTemplates = {};
    $scope.resourceServices = {};
    $scope.idToTemplate = {};
    $scope.services = {
        "Subjects": Subjects,
        "Agents": Agents,
        "Languages": Languages,
        "Providers": Providers
    };
    $scope.hasRequired = false;
    $scope.dataTypes = {};

    $scope.currentWork = {};
    $scope.loading = {};
    $scope.isDirty = false;
    $scope.pivoting = false;
    $scope.created = []; // @@@ new resources created in this session, TBD
    $scope.activeResoure = null;
    $scope.showExport = false;
    $scope.exportedRDF = "";
    $scope.dz = null;
    
    var namespacer, ExportModalCtrl, EditLiteralCtrl, SubResourceCtrl;

    namespacer = new Namespace();

    ExportModalCtrl = function($scope, $modalInstance, rdf) {
        $scope.rdf = rdf;
        $scope.close = function() {
            $modalInstance.dismiss();
        };
    };

    EditLiteralCtrl = function($scope, $modalInstance, property, literal) {
        $scope.property = property;
        $scope.editing = { "value": literal };
        $scope.save = function() {
            $modalInstance.close($scope.editing.value);
        };
        $scope.cancel = function() {
            $modalInstance.dismiss();
        };
    };

    SubResourceCtrl = function($scope, $modalInstance, templates, dataTypes, res, initProp, setTextValue, setDateValue, removeValue, editLiteral, editResource, currentWork, created) {
        $scope.initializeProperty = initProp;
        $scope.setTextValue = setTextValue;
        $scope.setDateValue = setDateValue;
        $scope.removeValue = removeValue;
        $scope.editLiteral = editLiteral;
        $scope.editResource = editResource;
        $scope.resourceTemplates = templates;
        $scope.dataTypes = dataTypes;
        $scope.typeLabel = templates[res].getLabel();
        $scope.resource = {
            'uri': res,
            'label': templates[res].getLabel(),
            'disabled': false
        };
        $scope.currentWork = currentWork;
        $scope.created = created;
        $scope.isDirty = false;
        $scope.pivoting = true;
        $scope.loading = {};

        var flags;
        flags = { "hasRequired": false, "loading": $scope.loading };
        angular.forEach(templates[res].getPropertyTemplates(), function(prop) {
            $scope.initializeProperty($scope.currentWork, prop, flags);
        });
        $scope.hasRequired = flags.hasRequired;

        $scope.cancel = function() {
            $modalInstance.dismiss();
        };

        $scope.save = function() {
            $scope.currentWork.type = new PredObject(templates[res].getClassID(), templates[res].getClassID(), "resource", false);
            $modalInstance.close($scope.currentWork);
        };
    };

    // initialize by retrieving configuration and profiles
    Configuration.get(null, null).$promise.then(function(config) {
        $scope.config = config;
        return $q.all(config.profiles.map(function(p) {
            return Profiles.get({}, {"profile": p, "format": "json"}).$promise.then(function(resp) {
                var prof;
                prof = new Profile(p, resp.Profile);
                $scope.profiles.push(prof);
                return $scope.initialize(prof);
            });
        })).then(function(responses) {
            var resources = [];
            responses.map(function(curr) {
                resources = resources.concat(curr);
                return curr;
            });
            $scope.initialized = true;
            $scope.resourceOptions = resources;
        });
    });

    $scope.initialize = function(profile) {
        var workTemplate, instanceIDs, instanceTemplate, opts;
        opts = [];
        // interpret configuration for labels and classes to use out of profile
        angular.forEach($scope.config.useWorks, function(work) {
            workTemplate = profile.getResourceTemplate(work);
            if (workTemplate !== null && workTemplate.isWork()) {
                instances = profile.getWorkInstances(work);
                angular.forEach(instances, function(instanceTemplate) {
                    instanceTemplate.mergeWork(workTemplate);
                    $scope.resourceTemplates[instanceTemplate.getClassID()] = instanceTemplate;
                    opts.push({"uri": instanceTemplate.getClassID(), "label": instanceTemplate.getLabel(), "sortKey": workTemplate.getLabel() + "-" + instanceTemplate.getLabel(), "disabled": false});
                });
                opts.push({"uri": workTemplate.getClassID(), "label": workTemplate.getLabel(), "disabled": true, "sortKey": workTemplate.getLabel()});
            }
        });
        profile.registerResourceTemplates($scope.idToTemplate);

        // interpret configuration for resource types to lookup services
        angular.forEach($scope.config.resourceServiceMap, function(item) {
            angular.forEach(item.services, function(service) {
                if (typeof $scope.resourceServices[item.resource] !== "undefined") {
                    $scope.resourceServices[item.resource].push($scope.services[service]);
                } else {
                    $scope.resourceServices[item.resource] = [$scope.services[service]];
                }
            });
        });

        angular.forEach($scope.config.dataTypes, function(dataType) {
            $scope.dataTypes[dataType.id] = dataType.handler;
        });

        return opts;
    };

    $scope.initializeProperty = function(work, property, flags) {
        var prop;
        prop = property.getProperty().getID();
        namespacer.extractNamespace(prop);
        if (typeof work[prop] === "undefined") {
            work[prop] = [];
        }
        if (!flags.hasRequired && property.isRequired()) {
            flags.hasRequired = true;
        }
        flags.loading[prop] = false;
    };

    $scope.newEdit = function(resource) {
        var props, flags, dz;
        $scope.isDirty = false;
        $scope.hasRequired = false;
        $scope.currentWork = {};
        $scope.loading = {};
        $scope.activeResource = $scope.resourceTemplates[resource.uri];
        props = $scope.activeResource.getPropertyTemplates();
        flags = { "hasRequired": false, "loading": $scope.loading };
        angular.forEach(props, function(prop) {
            $scope.initializeProperty($scope.currentWork, prop, flags);
        });
        $scope.hasRequired = flags.hasRequired;
        if ($scope.dz !== null) {
            $scope.dz.destroy();
            $scope.dz = null;
        }
        try {
            // assumes one dropzone per profile
            $scope.dz = new Dropzone("div.active div.dropzone", {
                // @@@ provide this service - receives, stores, returns URI
                "url": "/upload/image",
                "autoProcessQueue": true,
                "uploadMultiple": true,
                "parallelUploads": 100,
                "maxFiles": 100,
                // @@@ for demo purposes; when real, hook into success event
                "accept": function(file, done) {
                    var imguri, prop;
                    prop = this.element.dataset.propUri;
                    imguri = $scope.randomRDFID() + "/" + file.name;
                    $scope.$apply(function() {
                        $scope.isDirty = true;
                        $scope.currentWork[prop].push(new PredObject(file.name, imguri, "resource", true));
                    });
                    done("Uploading not enabled in this prototype.");
                }
            });
        } catch(ex) {
            // ignore errors dealing with failing selector - that's the goal
        }
    };

    $scope.autocomplete = function(property, typed) {
        var classID, services, completer;
        completer = property.getConstraint().getReference();
        // @@@ just take the first, not dealing with combining mock services
        if (typeof completer === "object") {
            completer = completer[0];
        }
        classID = $scope.idToTemplate[completer].getClassID();
        services = $scope.resourceServices[classID];
        // @@@ handle multiple services - or maybe have a proxied
        //     endpoint local to this host that does all the service
        //     handling, with arguments for which services to query
        return services[0].get({"search": typed}).$promise.then(function(response) {
            // @@@ matching should be handled by the service, just
            //     use response when it's implemented
            var matches = [];
            angular.forEach(response.values, function(val) {
                if (val.label.toLowerCase().indexOf(typed.toLowerCase()) >= 0) {
                    matches.push(val);
                }
            });
            return matches;
        });
    };

    $scope.reset = function() {
        $scope.isDirty = false;
        angular.forEach($scope.currentWork, function(p, key) {
            $scope.currentWork[key] = [];
        });
    };

    $scope.setDateValue = function(work, property, newVal) {
        if (typeof newVal === "object" && typeof newVal.toISOString !== "undefined") {
            $scope.setTextValue(work, property, newVal.toISOString().split("T")[0]);
        } else {
            $scope.setTextValue(work, property, newVal);
        }
    };

    $scope.setTextValue = function(work, property, newVal) {
        var propID, seen, val;
        propID = property.getProperty().getID();
        objType = property.getType();
        seen = false;
        angular.forEach(work[propID], function(val) {
            if (val.getValue() === newVal) {
                seen = true;
            }
        });
        if (!seen && newVal !== "") {
            $scope.isDirty = true;
            val = new PredObject(newVal, newVal, objType, true);
            if (property.hasConstraint() && property.getConstraint().hasComplexType()) {
                val.setDatatype(property.getConstraint().getComplexTypeID());
            };
            work[propID].push(val);
        }
    };

    $scope.selectValue = function(property, selection, created) {
        var seen = false;
        prop = property.getProperty().getID();
        objType = property.getType();
        angular.forEach($scope.currentWork[prop], function(val) {
            if (selection.uri === val.getValue()) {
                seen = true;
            }
        });
        if (typeof created === "undefined") {
            created = false;
        }
        if (!seen) {
            $scope.isDirty = true;
            $scope.currentWork[prop].push(new PredObject(selection.label, selection.uri, objType, created));
        }
    };

    $scope.editLiteral = function(work, property, value) {
        var modal = $modal.open({
            templateUrl: "edit-literal.html",
            controller: EditLiteralCtrl,
            resolve: {
                literal: function() {
                    return value.getValue();
                },
                property: function() {
                    return property.getProperty().getLabel();
                }
            }
        });

        modal.result.then(function(newValue) {
            var objs, target, mod;
            objs = work[property.getProperty().getID()];
            angular.forEach(objs, function(obj, idx) {
                if (obj.getValue() === value.getValue()) {
                    target = idx;
                };
            })
            mod = objs[target];
            mod.setLabel(newValue);
            mod.setValue(newValue);
        });
    };

    $scope.editResource = function(property, value) {
        var toEdit, ref;
        angular.forEach($scope.created, function(val) {
            if (val.id === value.getValue()) {
                toEdit = val;
            }
        });
        angular.forEach($scope.idToTemplate, function(tmpl, key) {
            if (tmpl.getClassID() === toEdit.type.getValue()) {
                ref = key;
            }
        });
        $scope.pivot(property, ref, toEdit);
    };

    $scope.removeValue = function(work, property, value) {
        var prop, empty, objs, rmIdx;
        empty = true;
        prop = property.getProperty().getID();
        objs = work[prop];
        rmIdx = -1;
        angular.forEach(objs, function(obj, idx) {
            if (obj.getValue() === value.getValue()) {
                rmIdx = idx;
            }
        });
        if (rmIdx >= 0) {
            objs.splice(rmIdx, 1);
            angular.forEach(work, function(vals) {
                if (vals.length > 0) {
                    empty = false;
                }
            });
            if (empty) {
                $scope.isDirty = false;
            }
        }
    };

    $scope.pivot = function(property, ref, toEdit) {
        var modal, ref, res, tmpls;
        if (typeof ref === "undefined") {
            ref = property.getConstraint().getReference();
        }
        if (typeof toEdit === "undefined") {
            toEdit = {};
        }
        res = $scope.idToTemplate[ref];
        tmpls = {};
        tmpls[res.getClassID()] = res;
        modal = $modal.open({
            templateUrl: "pivot.html",
            controller: SubResourceCtrl,
            windowClass: "pivot",
            resolve: {
                templates: function() {
                    return tmpls;
                },
                res: function() {
                    return res.getClassID();
                },
                initProp: function() {
                    return $scope.initializeProperty;
                },
                setTextValue: function() {
                    return $scope.setTextValue;
                },
                setDateValue: function() {
                    return $scope.setDateValue;
                },
                removeValue: function() {
                    return $scope.removeValue;
                },
                editLiteral: function() {
                    return $scope.editLiteral;
                },
                editResource: function() {
                    return $scope.editResource;
                },
                dataTypes: function() {
                    return $scope.dataTypes;
                },
                currentWork: function() {
                    return toEdit;
                },
                created: function() {
                    return $scope.created;
                }
            }
        });

        modal.result.then(function(newResource) {
            if (typeof newResource.id === "undefined") {
                newResource.id = $scope.randomRDFID();
                $scope.created.push(newResource);
                $scope.selectValue(property, {"label": "[created]", "uri": newResource.id}, true);
            }
        });
    };

    $scope.randomRDFID = function() {
        return "http://example.org/" + Math.floor(Math.random()*1000000);
    };

    $scope.submit = function() {
        if ($scope.validate()) {
            $scope.exportRDF();
            $scope.showRDF();
        } else {
            alert("Please fill out all required properties before exporting.");
        }
    };

    $scope.validate = function() {
        var active, props, valid;
        active = $scope.activeResource.getClassID();
        props = $scope.resourceTemplates[active].getPropertyTemplates();
        valid = true;
        angular.forEach(props, function(prop) {
            if (prop.isRequired() && $scope.currentWork[prop.getProperty().getID()].length === 0) {
                valid = false;
            }
        });
        return valid;
    };

    $scope.exportRDF = function() {
        // @@@ may want a basic triple API library for this instead
        //     of generating strings
        var subj, rdf, tail, refs;
        subj = $scope.randomRDFID(); // @@@ should be a service
        rdf = '<?xml version="1.0"?>\n\n' + namespacer.buildRDF() + '\n';
        tail = '</rdf:RDF>\n';
        refs = [];
        rdf += $scope.exportResource($scope.currentWork, subj, $scope.activeResource.getClassID(), refs);
        angular.forEach($scope.created, function(res) {
            if (refs.indexOf(res.id) >= 0) {
                rdf += $scope.exportResource(res);
            }
        });
        $scope.exportedRDF = rdf + tail;
    };

    $scope.exportResource = function(res, id, type, refs) {
        var frag = "";
        angular.forEach(res, function(vals, prop) {
            var nsProp;
            if (prop === "id" && typeof id === "undefined") {
                id = vals;
            } else if (prop === "type" && typeof type === "undefined") {
                type = vals.getValue();
            } else {
                nsProp = namespacer.extractNamespace(prop);
                angular.forEach(vals, function(val) {
                    if (val.isResource()) {
                        frag += '    <' + nsProp.namespace + ':' + nsProp.term + ' rdf:resource="' + val.getValue() + '"/>\n';
                        if (typeof refs !== "undefined") {
                            refs.push(val.getValue());
                        }
                    } else {
                        frag += '    <'+ nsProp.namespace + ':' + nsProp.term;
                        if (val.hasDatatype()) {
                            frag += ' rdf:datatype="' + val.getDatatype() + '"';
                        }
                        frag += '>' + val.getValue() + '</' + nsProp.namespace  + ':' + nsProp.term + '>\n';
                    }
                });
            }
        });
        return '  <rdf:Description rdf:about="' + id + '">\n    <rdf:type rdf:resource="' + type + '"/>\n' + frag + '  </rdf:Description>\n';;
    };

    $scope.showRDF = function() {
        $modal.open({
            templateUrl: "export.html",
            controller: ExportModalCtrl,
            windowClass: "export",
            resolve: {
                rdf: function() {
                    return $scope.exportedRDF;
                }
            }
        });
    };
};

EditorCtrl.$inject = ["$scope", "$q", "$modal", "Configuration", "Profiles", "Subjects", "Agents", "Languages", "Providers"];
