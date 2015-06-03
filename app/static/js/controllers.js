bibframeEditorApp.controller("EditorCtrl", ["$scope", "$q", "$modal", "$http", "Configuration", "Profiles", "Store", "Query", "Message", function($scope, $q, $modal, $http, Configuration, Profiles, Store, Query, Message) {
    var SCHEMAS = "urn:schemas";

    $scope.initialized = false;
    $scope.progress = 0;
    $scope.config = {};
    $scope.firstClass = [];
    $scope.resourceToFirstClassMap = {};
    $scope.profiles = [];
    $scope.resourceTemplates = {};
    $scope.resourceTypes = {};
    $scope.typeMap = {};
    $scope.idToTemplate = {};
    $scope.hasRequired = false;
    $scope.dataTypes = {};
    $scope.inputted = {};
    $scope.useServices = {};

    $scope.store = rdfstore.create();
    $scope.currentWork = {};
    $scope.loading = {};
    $scope.flags = {
        isDirty: false
    };
    $scope.pivoting = false;
    $scope.editExisting = false;
    $scope.created = []; // @@@ new resources created in this session, TBD
    $scope.activeResource = null;
    $scope.showExport = false;
    $scope.exportedRDF = "";
    $scope.cache = {
        dz: null
    };
    $scope.messages = Message.messages();
    $scope.closeMsg = function(idx) {
        Message.removeMessage(idx);
    };
    
    var namespacer, ExportModalCtrl, EditLiteralCtrl, SubResourceCtrl;

    namespacer = new Namespace();

    ExportModalCtrl = function($scope, $modalInstance, rdf) {
        $scope.rdf = rdf;
        $scope.close = function() {
            $modalInstance.dismiss();
        };
    };

    EditLiteralCtrl = function($scope, $modalInstance, property, literal, dataTypes, resource, setDateValue, setTextValue, currentWork) {
        $scope.property = property.getProperty().getLabel();
        $scope.prop = property;
        $scope.dataTypes = dataTypes;
        $scope.resource = resource;
        $scope.setDateValue = setDateValue;
        $scope.setTextValue = setTextValue;
        $scope.currentWork = currentWork;
        $scope.inputted = {};
        $scope.inputted[$scope.prop.getProperty().getID()] = literal;
        $scope.editExisting = true;
        $scope.pivoting = false;
        $scope.save = function() {
            $modalInstance.close($scope.inputted[$scope.prop.getProperty().getID()]);
        };
        $scope.cancel = function() {
            $modalInstance.dismiss();
        };
    };

    SubResourceCtrl = function($scope, $modalInstance, templates, dataTypes, res, initProp, setTextValue, setDateValue, removeValue, editLiteral, editResource, currentWork, created, idToTemplate, pivot) {
        $scope.initializeProperty = initProp;
        $scope.setTextValue = setTextValue;
        $scope.setDateValue = setDateValue;
        $scope.removeValue = removeValue;
        $scope.editLiteral = editLiteral;
        $scope.editResource = editResource;
        $scope.pivot = pivot;
        $scope.resourceTemplates = templates;
        $scope.dataTypes = dataTypes;
        $scope.typeLabel = templates[res].getLabel();
        $scope.idToTemplate = idToTemplate;
        $scope.resource = {
            'uri': res,
            'label': templates[res].getLabel(),
            'disabled': false
        };
        $scope.currentWork = currentWork;
        $scope.created = created;
        $scope.flags = {
            isDirty: false
        };
        $scope.pivoting = true;
        $scope.editExisting = false;
        $scope.loading = {};
        $scope.inputted = {};

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
        var total, current, incrementProgress;
        
        $scope.config = config;

        $scope.firstClass = config.firstClass;

        total = (config.schemas.length * 2) + config.profiles.length;
        current = 0;
        incrementProgress = function() {
            $scope.progress = Math.round((++current / total) * 100);
        };

        return $q.all(config.schemas.map(function(s) {
            incrementProgress();
            return $http.get('schema/' + s);
        })).then(function(httpResponses) {
            httpResponses.map(function(response) {
                $scope.store.load('text/turtle', response.data, 'urn:schemas', function(success) {
                    incrementProgress();
                    $scope.$apply();
                    if (!success) {
                        Message.addMessage("Error loading schema " + response.config.url + ", please check for RDF validity", "danger");
                    } else {
                        angular.forEach($scope.firstClass, function(fc) {
                            $scope.store.execute("SELECT ?s { ?s rdfs:subClassOf <" + fc + "> }", [SCHEMAS], [], function(success, results) {
                                angular.forEach(results, function(r) {
                                    $scope.resourceToFirstClassMap[r.s.value] = fc;
                                });
                            });
                        });
                    }
                });
            });
        }, function(fail) {
            Message.addMessage('Failed to load schema ' + fail.config.url + ': HTTP ' + fail.status + ' - ' + fail.statusText, 'danger');
        }).then(function() {
            $scope.store.registerDefaultProfileNamespaces();
            $q.all(config.profiles.map(function(p) {
                return Profiles.get({}, {"profile": p, "format": "json"}).$promise.then(function(resp) {
                    var prof, promises;
                    incrementProgress();
                    prof = new Profile(p);
                    promises = prof.init(resp.Profile, $scope.config, function(res, query) {
                        var deferred = $q.defer();
                        $scope.store.execute(
                            query,
                            [SCHEMAS],
                            [],
                            function(success, results) {
                                if (success) {
                                    deferred.resolve([res, results]);
                                } else {
                                    deferred.reject('Query failed: ' + query);
                                }
                            }
                        );
                        return deferred.promise;
                    });
                    return $q.all(promises).then(function(results) {
                        results.map(function(r) {
                            prof._processQuery($scope.firstClass, r);
                        });
                        $scope.profiles.push(prof);
                        return $scope.initialize(prof);
                    });
                });
            })).then(function(responses) {
                // After all resources are registered, generate options
                var resources, relation;
                resources = [];
                responses.map(function(curr) {
                    angular.forEach(curr, function(template) {
                        relation = null;
                        if (typeof $scope.resourceTemplates[template.getRelation()] !== "undefined") {
                            relation = $scope.resourceTemplates[template.getRelation()];
                            template.mergeTemplate(relation);
                        }
                        resources.push({
                            "uri": template.getClassID(),
                            "label": template.getLabel(),
                            "sortKey": ((relation !== null) ? relation.getLabel() + "-" : "") + template.getLabel(),
                            "child": relation !== null
                        });
                        return template;
                    });
                });
                $scope.initialized = true;
                $scope.resourceOptions = resources;
            });
        });
    });

    $scope.initialize = function(profile) {
        var instances, instanceTemplate, resources;
        resources = [];

        angular.forEach($scope.firstClass, function(fc) {
            var templates;
            templates = profile.getClassTemplates(fc);
            if (templates !== null) {
                angular.forEach(templates, function(template) {
                    resources.push(template);
                    $scope.resourceTemplates[template.getClassID()] = template;
                });
            }
        });
        profile.registerResourceTemplates($scope.idToTemplate);

        // interpret configuration for resource types to lookup services
        angular.forEach($scope.config.resourceServiceMap, function(item, key) {
            if (item.type) {
                $scope.resourceTypes[key] = item.type;
                $scope.typeMap[item.type] = item.propertyMap;
            } else {
                $scope.resourceTypes[key] = item;
            }
        });

        angular.forEach($scope.config.dataTypes, function(dataType) {
            $scope.dataTypes[dataType.id] = dataType.handler;
        });

        return resources;
    };

    $scope.initializeProperty = function(work, property, flags) {
        var prop, constraint, defaultVal;
        prop = property.getProperty().getID();
        if (typeof work[prop] === "undefined") {
            work[prop] = [];
        }
        if (property.hasConstraint()) {
            constraint = property.getConstraint();
            if (constraint.hasDefaultURI()) {
                if (constraint.hasDefaultLiteral()) {
                    defaultVal = new PredObject(constraint.getDefaultLiteral(), constraint.getDefaultURI(), property.getType(), false);
                } else {
                    defaultVal = new PredObject(constraint.getDefaultURI(), constraint.getDefaultURI(), property.getType(), false);
                }
                work[prop].push(defaultVal);
            } else if (property.getConstraint().hasDefaultLiteral()) {
                defaultVal = new PredObject(constraint.getDefaultLiteral(), null, property.getType(), false);
                work[prop].push(defaultVal);
            }
        }
        if (!flags.hasRequired && property.isRequired()) {
            flags.hasRequired = true;
        }
        flags.loading[prop] = false;
    };

    $scope.newEdit = function(resource) {
        var props, flags, dz;
        $scope.flags = {
            isDirty: false
        };
        $scope.hasRequired = false;
        $scope.currentWork = {};
        $scope.loading = {};
        if ($scope.cache.dz !== null) {
            $scope.cache.dz.destroy();
            $scope.cache.dz = null;
        }
        $scope.activeResource = $scope.resourceTemplates[resource.uri];
        props = $scope.activeResource.getPropertyTemplates();
        flags = { "hasRequired": false, "loading": $scope.loading };
        angular.forEach(props, function(prop) {
            $scope.initializeProperty($scope.currentWork, prop, flags);
        });
        $scope.hasRequired = flags.hasRequired;
    };

    $scope.autocomplete = function(property, typed) {
        var i, classes, single, refs, services, idx, srv, filtered;
        classes = [];
        services = [];
        filtered = [];
        refs = property.getConstraint().getReference();

        if (typeof refs === "object") {
            for (i = 0; i < refs.length; i++) {
                single = $scope.config.resourceServiceMap[$scope.idToTemplate[refs[i]].getClassID()];
                if (classes.indexOf(single) < 0) {
                    classes.push(single);
                }
            }
        } else {
            classes.push($scope.config.resourceServiceMap[$scope.idToTemplate[refs].getClassID()]);
        }

        for (i = 0; i < classes.length; i++) {
            services = services.concat($scope.config.serviceProviderMap[classes[i]]);
        }

        angular.forEach(services, function(service, i) {
            // unclear what would happen if index was 0, do not handle
            idx = service.indexOf(":");
            if (idx > 0) {
                srv = service.substr(0, idx);
            } else {
                srv = service;
            }
            if ($scope.useServices[srv] && filtered.indexOf(service) < 0) {
                filtered.push(service);
            }
        });

        return Query.suggest({"q": typed, "services": JSON.stringify(filtered.sort())}).$promise;
    };

    $scope.reset = function(formScope, formName) {
        $scope.flags.isDirty = false;
        if ($scope.cache.dz) {
            $scope.cache.dz.removeAllFiles();
        }
        angular.forEach($scope.currentWork, function(p, key) {
            $scope.currentWork[key] = [];
        });
        $scope.inputted = {};
        formScope[formName].$setPristine();
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
            $scope.flags.isDirty = true;
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
            $scope.flags.isDirty = true;
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
                    return property;
                },
                dataTypes: function() {
                    return $scope.dataTypes;
                },
                resource: function() {
                    return {"uri": "noop"};
                },
                setDateValue: function() {
                    return $scope.setDateValue;
                },
                setTextValue: function() {
                    return $scope.setTextValue;
                },
                currentWork: function() {
                    return work;
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
        if (typeof property === "string") {
            prop = property;
        } else {
            prop = property.getProperty().getID();
        }
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
                $scope.flags.isDirty = false;
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
                idToTemplate: function() {
                    return $scope.idToTemplate;
                },
                created: function() {
                    return $scope.created;
                },
                pivot: function() {
                    return $scope.pivot;
                }
            }
        });

        modal.result.then(function(newResource) {
            if (typeof newResource.id === "undefined") {
                Store.id(null, null).$promise.then(function(resp) {
                    newResource.id = resp.id;
                    $scope.created.push(newResource);
                    $scope.selectValue(property, {"label": "[created]", "uri": newResource.id}, true);
                });
            }
        });
    };

    $scope.randomRDFID = function() {
        return "http://example.org/" + Math.floor(Math.random()*1000000);
    };

    $scope.export = function() {
        $scope.transmit("export");
    };

    $scope.submit = function() {
        $scope.transmit("save");
    };

    $scope.transmit = function(flag) {
        if ($scope.validate()) {
            if (flag === "export") {
                $scope.exportRDF();
            } else if (flag === "save") {
                $scope.exportN3($scope.persist);
            }
        } else {
            alert("Please fill out all required properties before " + ((flag === "save") ? "saving" : "exporting") + ".");
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

    $scope.persist = function(n3) {
        Store.new(null, {"n3": n3}).$promise.then(function(resp) {
            // console.log(resp);
        });
    };

    $scope.exportN3 = function(next) {
        Store.id(null, null).$promise.then(function(resp) {
            var subj, rdf, refs;
            subj = resp.id;
            rdf = '@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n\n';
            refs = [];
            rdf += $scope.exportResourceN3($scope.currentWork, subj, $scope.activeResource.getClassID(), refs);
            angular.forEach($scope.created, function(res) {
                if (refs.indexOf(res.id) >= 0) {
                    rdf += $scope.exportResourceN3(res);
                }
            });

            $scope.exportedRDF = rdf;
            next(rdf);
        });        
    };

    $scope.exportResourceN3 = function(res, id, type, refs) {
        var frag = '';
        angular.forEach(res, function(vals, prop) {
            if (prop === "id" && typeof id === "undefined") {
                id = vals;
            } else if (prop === "type" && typeof type === "undefined") {
                type = vals.getValue();
            } else {
                angular.forEach(vals, function(val) {
                    if (val.isResource()) {
                        frag += '  <' + prop + '> <' + val.getValue() + '>;\n';
                        if (typeof refs !== "undefined") {
                            refs.push(val.getValue());
                        }
                    } else {
                        frag += '  <' + prop + '> \"' + val.getValue() + '\"';
                        if (val.hasDatatype()) {
                            frag += '^^<' + val.getDatatype() + '>';
                        }
                        frag += ';';
                    }
                });
            }
        });
        return '<' + id + '>\n' + frag + ' rdf:type <' + type + '> .\n';
    };

    $scope.exportRDF = function() {
        // @@@ generate something that can be inserted into the triplestore
        Store.id(null, null).$promise.then(function(resp) {
            // @@@ may want a basic triple API library for this instead
            //     of generating strings
            var subj, rdf, head, tail, refs;
            subj = resp.id;
            rdf = '';
            tail = '</rdf:RDF>\n';
            refs = [];
            rdf += $scope.exportResource($scope.currentWork, subj, $scope.activeResource, refs);
            angular.forEach($scope.created, function(res) {
                if (refs.indexOf(res.id) >= 0) {
                    rdf += $scope.exportResource(res);
                }
            });
            head = '<?xml version="1.0"?>\n\n' + namespacer.buildRDF() + '\n';
            $scope.exportedRDF = head + rdf + tail;
            $scope.showRDF();
        });
    };
    
    $scope.exportResource = function(res, id, resourceTemplate, refs) {
        var frag = "", result = "", relFrag = "", type = null, split = false, relation, nsProp;

        if (typeof resourceTemplate !== "undefined" && resourceTemplate !== null) {
            type = resourceTemplate.getClassID();
            relation = resourceTemplate.getRelation();
            if (resourceTemplate.getRelation() !== null) {
                split = true;
            }
        }
        angular.forEach(res, function(vals, prop) {
            var nsProp;
            if (prop === "id" && typeof id === "undefined") {
                id = vals;
            } else if (prop === "type" && type === null) {
                type = vals.getValue();
            } else {
                nsProp = namespacer.extractNamespace(prop);
                if ((split && resourceTemplate.hasProperty(prop)) || !split) {
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
                } else {
                    angular.forEach(vals, function(val) {
                        if (val.isResource()) {
                            relFrag += '    <' + nsProp.namespace + ':' + nsProp.term + ' rdf:resource="' + val.getValue() + '"/>\n';
                            if (typeof refs !== "undefined") {
                                refs.push(val.getValue());
                            }
                        } else {
                            relFrag += '    <'+ nsProp.namespace + ':' + nsProp.term;
                            if (val.hasDatatype()) {
                                relFrag += ' rdf:datatype="' + val.getDatatype() + '"';
                            }
                            relFrag += '>' + val.getValue() + '</' + nsProp.namespace  + ':' + nsProp.term + '>\n';
                        }
                    });
                }
            }
        });
        if (split) {
            nsProp = namespacer.extractNamespace('http://bibframe.org/vocab/instanceOf'); // @@@ faking it
            frag += '    <' + nsProp.namespace + ':' + nsProp.term + ' rdf:resource="' + id + '-work" />\n';
            result += '  <rdf:Description rdf:about="' + id + '-work">\n    <rdf:type rdf:resource="' + relation + '"/>\n' + relFrag + '  </rdf:Description>\n';
        }
        result += '  <rdf:Description rdf:about="' + id + '">\n    <rdf:type rdf:resource="' + type + '"/>\n' + frag + '  </rdf:Description>\n';
        return result;
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
}]);
