var EditorCtrl = function($scope, $q, $modal, Configuration, Profiles, Subjects, Agents, Languages, Providers) {
    $scope.initialized = false;
    $scope.config = {};
    $scope.profiles = {};
    $scope.resourceTemplates = {};
    $scope.resourceServices = {};
    $scope.idToTemplate = {};
    $scope.autocompleteLoading = {};
    $scope.autocompletes = {};
    $scope.services = {
        "Subjects": Subjects,
        "Agents": Agents,
        "Languages": Languages,
        "Providers": Providers
    };
    $scope.hasRequired = false;
    $scope.dataTypes = {};

    $scope.currentWork = {};
    $scope.isDirty = false;
    $scope.activeResoure = null;
    $scope.showExport = false;
    $scope.exportedRDF = "";

    var namespacer, exportModalCtrl;
    namespacer = new Namespace();
    ExportModalCtrl = function($scope, $modalInstance, rdf) {
        $scope.rdf = rdf;
        $scope.close = function() {
            $modalInstance.dismiss();
        };
    };

    // initialize by retrieving configuration and profiles
    Configuration.get(null, null).$promise.then(function(config) {
        $scope.config = config;
        return $q.all(config.profiles.map(function(p) {
            return Profiles.get({}, {"profile": p, "format": "json"}).$promise.then(function(resp) {
                var prof;
                prof = new Profile(p, resp.Profile);
                return $scope.initialize(prof);
            });
        })).then(function(responses) {
            var profiles = [];
            responses.map(function(curr) {
                profiles = profiles.concat(curr);
                return curr;
            });
            $scope.initialized = true;
            $scope.profileOptions = profiles;
        });
    });

    $scope.initialize = function(profile) {
        var workTemplate, instanceIDs, instanceTemplate, opts;
        opts = [];
        // interpret configuration for labels and classes to use out of profile
        angular.forEach($scope.config.useWorks, function(work) {
            workTemplate = profile.getResourceTemplate(work);
            if (workTemplate !== null && workTemplate.isWork()) {
                instanceIDs = workTemplate.getInstancesID();
                angular.forEach(instanceIDs, function(id) {
                    instanceTemplate = profile.getTemplateByID(id);
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

    $scope.newEdit = function(profile) {
        var props;
        $scope.isDirty = false;
        $scope.hasRequired = false;
        $scope.currentWork = {};
        $scope.activeResource = $scope.resourceTemplates[profile.uri];
        props = $scope.activeResource.getPropertyTemplates();
        angular.forEach(props, function(prop) {
            $scope.initializeProperty(prop);
        });
    };

    $scope.autocomplete = function(property, typed) {
        var classID, services, completer;
        completer = property.getConstraint().getReference();
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

    $scope.completeLoading = function(prop) {
        return $scope.autocompleteLoading[prop.getProperty().getID()];
    };

    $scope.reset = function() {
        $scope.isDirty = false;
        angular.forEach($scope.currentWork, function(p, key) {
            $scope.currentWork[key] = [];
        });
    };

    $scope.randomRDFID = function() {
        return "http://example.org/" + Math.floor(Math.random()*1000000);
    };

    $scope.exportRDF = function() {
        // @@@ may want a basic triple API library for this instead
        //     of generating strings
        var subj, rdf, tail;
        subj = $scope.randomRDFID(); // @@@ should be a service
        rdf = '<?xml version="1.0"?>\n\n' + namespacer.buildRDF() + '\n  <rdf:Description rdf:about="' + subj + '">\n';
        tail = '  </rdf:Description>\n</rdf:RDF>\n';
        rdf += '    <rdf:type rdf:resource="' + $scope.activeResource.getClassID() + '"/>\n';
        angular.forEach($scope.currentWork, function(vals, prop) {
            var nsProp;
            nsProp = namespacer.extractNamespace(prop);
            angular.forEach(vals, function(val) {
                if (val.type === "resource") {
                    rdf += '    <' + nsProp.namespace + ':' + nsProp.term + ' rdf:resource="' + val.value + '"/>\n';
                } else {
                    rdf += '    <'+ nsProp.namespace + ':' + nsProp.term;
                    if (typeof val.datatype !== "undefined") {
                        rdf += ' rdf:datatype="' + val.datatype + '"';
                    }
                    rdf += '>' + val.value + '</' + nsProp.namespace  + ':' + nsProp.term + '>\n';
                }
            });
        });
        $scope.exportedRDF = rdf + tail;
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

    $scope.setDateValue = function(property, newVal, objType) {
        if (typeof newVal === "object" && typeof newVal.toISOString !== "undefined") {
            $scope.setTextValue(property, newVal.toISOString().split("T")[0], objType);
        } else {
            $scope.setTextValue(property, newVal, objType);
        }
    };

    $scope.setTextValue = function(property, newVal, objType) {
        var propID, seen, val;
        propID = property.getProperty().getID();
        seen = false;
        angular.forEach($scope.currentWork[propID], function(val) {
            if (val.value === newVal) {
                seen = true;
            }
        });
        if (!seen && newVal !== "") {
            $scope.isDirty = true;
            val = {"label": newVal, "value": newVal, "type": objType};
            if (property.hasConstraint() && property.getConstraint().hasComplexType()) {
                val.datatype = property.getConstraint().getComplexTypeID();
            };
            $scope.currentWork[propID].push(val);
        }
    };

    $scope.selectValue = function(property, selection, objType) {
        var seen = false;
        $scope.autocompletes = {};
        $scope.complete = {};
        prop = property.getProperty().getID();
        angular.forEach($scope.currentWork[prop], function(val) {
            if (selection.uri === val.value) {
                seen = true;
            }
        });
        if (!seen) {
            $scope.isDirty = true;
            $scope.currentWork[prop].push({"label": selection.label, "value": selection.uri, "type": objType});
        }
    };

    $scope.initializeProperty = function(property) {
        var prop;
        prop = property.getProperty().getID();
        namespacer.extractNamespace(prop);
        if (typeof $scope.currentWork[prop] === "undefined") {
            $scope.currentWork[prop] = [];
        }
        if (!$scope.hasRequired && property.isRequired()) {
            $scope.hasRequired = true;
        }
    };

    $scope.removeValue = function(property, value) {
        var prop, empty;
        empty = true;
        prop = property.getProperty().getID();
        angular.forEach($scope.currentWork, function(objs, currentProp) {
            if (currentProp === prop) {
                var rmIdx = -1;
                angular.forEach(objs, function(obj, idx) {
                    if (obj.value === value.value) {
                        rmIdx = idx;
                    }
                });
                if (rmIdx >= 0) {
                    objs.splice(rmIdx, 1);
                    angular.forEach($scope.currentWork, function(vals) {
                        if (vals.length > 0) {
                            empty = false;
                        }
                    });
                    if (empty) {
                        $scope.isDirty = false;
                    }
                }
            }
        });
    };
};

EditorCtrl.$inject = ["$scope", "$q", "$modal", "Configuration", "Profiles", "Subjects", "Agents", "Languages", "Providers"];

