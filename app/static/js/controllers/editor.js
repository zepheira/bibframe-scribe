(function() {
    angular
        .module("bibframeEditor")
        .controller("EditorController", ["$scope", "$modal", "$log", "Store", "Configuration", "Query", "Graph", "Message", "Resolver", "Namespace", "Progress", "Property", "PredObject", "ValueConstraint", "PropertyTemplate", "ResourceTemplate", "Resource", "Profile", "ResourceStore", "TemplateStore", EditorController]);

    function EditorController($scope, $modal, $log, Store, Configuration, Query, Graph, Message, Resolver, Namespace, Progress, Property, PredObject, ValueConstraint, PropertyTemplate, ResourceTemplate, Resource, Profile, ResourceStore, TemplateStore) {
        $scope.inputted = {};
        $scope.editExisting = false; // @@@ redo this
        $scope.pivoting = false;

        $scope.newEdit = newEdit;
        $scope.autocomplete = autocomplete;
        $scope.reset = reset;
        $scope.selectValue = selectValue;
        $scope.editLiteral = editLiteral;
        $scope.editResource = editResource;
        $scope.popoverResource = popoverResource;
        $scope.showResource = showResource;
        $scope.pivot = pivot;
        $scope.randomRDFID = randomRDFID;
        $scope.display = display;
        $scope.submit = submit;
        $scope.transmit = transmit;
        $scope.validate = validate;
        $scope.persist = persist;
        $scope.showRDF = showRDF;
        
        $scope.progress = Progress.getCurrent;
        $scope.messages = Message.messages;
        $scope.initialized = Configuration.isInitialized;
        $scope.resourceOptions = Configuration.getResourceOptions;
        $scope.activeTemplate = ResourceStore.getActiveTemplate;
        $scope.currentWork = ResourceStore.getCurrent;
        $scope.isDirty = ResourceStore.isDirty;
        $scope.config = Configuration.getConfig;
        $scope.getTemplateByClassID = TemplateStore.getTemplateByClassID;
        $scope.hasRequired = ResourceStore.hasRequired;
        $scope.isLoading = ResourceStore.isLoading;
        $scope.getReferenceResourceType = TemplateStore.getReferenceResourceType;
        $scope.dataTypes = ResourceStore.getDataTypeByID;

        Configuration.initialize();

        /**
         * Wipe out currently displayed resource (in $scope) and replace with
         * pristine $scope model.
         */
        function newEdit(resource) {
            var props, flags, dz;
            flags = { "hasRequired": false, "loading": ResourceStore.getAllLoading() };

            $scope.inputted = {};
            ResourceStore.clear();
            ResourceStore.setActiveTemplate(TemplateStore.getTemplateByClassID(resource.uri));
            props = ResourceStore.getActiveTemplate().getPropertyTemplates();
            angular.forEach(props, function(prop) {
                ResourceStore.getCurrent().initializeProperty(prop, flags);
            });
            ResourceStore.setHasRequired(flags.hasRequired);
        }

        /**
         * Arguments are from input form, process and run to querying service.
         * @@@ service?
         */
        function autocomplete(property, typed) {
            var i, classes, single, refs, services, idx, srv, filtered;
            classes = [];
            services = [];
            filtered = [];
            refs = property.getConstraint().getReference();
            
            if (typeof refs === "object") {
                for (i = 0; i < refs.length; i++) {
                    single = Configuration.getConfig().resourceServiceMap[TemplateStore.getTemplateByID(refs[i]).getClassID()];
                    if (classes.indexOf(single) < 0) {
                        classes.push(single);
                    }
                }
            } else {
                classes.push(Configuration.getConfig().resourceServiceMap[TemplateStore.getTemplateByID(refs).getClassID()]);
            }
            
            for (i = 0; i < classes.length; i++) {
                services = services.concat(Configuration.getConfig().serviceProviderMap[classes[i]]);
            }
            
            angular.forEach(services, function(service, i) {
                // unclear what would happen if index was 0, do not handle
                idx = service.indexOf(":");
                if (idx > 0) {
                    srv = service.substr(0, idx);
                } else {
                    srv = service;
                }
                // @@@ $scope.useServices?
                if ($scope.useServices[srv] && filtered.indexOf(service) < 0) {
                    filtered.push(service);
                }
            });
            
            return Query.suggest({"q": typed, "services": JSON.stringify(filtered.sort())}).$promise;
        }

        /**
         * Fires when a dropdown item is selected
         * @@@ service? - with autocomplete?
         */
        function selectValue(property, selection, created) {
            var seen = false;
            prop = property.getProperty().getID();
            objType = property.getType();
            angular.forEach(ResourceStore.getCurrent().getPropertyValues(prop), function(val) {
                if (selection.uri === val.getValue()) {
                    seen = true;
                }
            });
            if (typeof created === "undefined") {
                created = false;
            }
            if (!seen) {
                ResourceStore.setDirty();
                ResourceStore.getCurrent().addPropertyValue(prop, new PredObject(selection.label, selection.uri, objType, created));
            }
        }

        /**
         * Wipe out $scope form data as if no input was made.
         * @@@ service - current work service
         */
        function reset(formScope, formName) {
            ResourceStore.reset();
            $scope.inputted = {};
            formScope[formName].$setPristine();
        }

        /**
         * Open a modal dialog for user to change a literal value.
         */
        function editLiteral(work, property, value) {
            // @@@ re-work, shouldn't need this resolution material at all
            var modal = $modal.open({
                templateUrl: "edit-literal.html",
                controller: "EditLiteralController",
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
        }

        /**
         * Shortcut for pivot call. Choose created resoure and matching
         * template before pivoting.
         * @@@service? - created works service
         */
        function editResource(property, value) {
            var toEdit, ref;
            angular.forEach(ResourceStore.getCreated(), function(val) {
                if (val.id === value.getValue()) {
                    toEdit = val;
                }
            });
            angular.forEach(TemplateStore.getTemplateIDHash(), function(tmpl, key) {
                if (tmpl.getClassID() === toEdit.type.getValue()) {
                    ref = key;
                }
            });
            // @@@re-do this
            $scope.pivot(property, ref, toEdit);
        }

        /**
         * Show a dialog with Resolver-queried RDF by putting result in $scope.
         * @@@service? - resolver service
         */
        function popoverResource(uri) {
            // @@@ redo this with a service
            if ($scope.popover.uri !== uri) {
                $scope.popover.uri = uri;
                $scope.popover.data = "Loading...";
                Resolver.resolve({"uri": uri}).$promise.then(function(data) {
                    $scope.popover.data = data.raw;
                }).catch(function(data) {
                    $scope.popover.data = "No additional data could be found.";
                });
            }
        }

        /**
         * Show a model dialog for an external URI using Resolver-queried
         * RDF - very similar to exported RDF dialog, perhaps combine.
         * @@@service?
         */
        function showResource(val) {
            // @@@ redo with a service, without resolver
            if (val.isResource()) {
                Resolver.resolve({"uri": val.getValue()}).$promise.then(function(data) {
                    $modal.open({
                        templateUrl: "show-resource.html",
                        controller: "ShowResourceController",
                        windowClass: "show-resource",
                        resolve: {
                            rdf: function() {
                                return data.raw;
                            },
                            label: function() {
                                return val.getLabel();
                            },
                            uri: function() {
                                return val.getValue();
                            }
                        }
                    });
                }).catch(function(data) {
                    $modal.open({
                        templateUrl: "show-resource.html",
                        controller: "ShowResourceController",
                        windowClass: "show-resource",
                        resolve: {
                            rdf: function() {
                                return "No additional data could be found.";
                            },
                            label: function() {
                                return val.getLabel();
                            },
                            uri: function() {
                                return val.getValue();
                            }
                        }
                    });
                });
            }
        }

        /**
         * Open up new input form in modal dialog to fill in a sub-resource
         * of the main form. Takes from and modifes $scope.
         * @@@service?
         */
        function pivot(property, ref, toEdit) {
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
                controller: "SubResourceController",
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
        }
        
        /**
         * Generate a random unique URI for a new resource.
         * @@@ service
         */
        function randomRDFID() {
            return "http://example.org/" + Math.floor(Math.random()*1000000);
        }

        /**
         * WAS export, but that's a reserved word.
         * Shortcut for displaying.
         */
        function display() {
            transmit("export");
        }

        /**
         * Shortcut for saving.
         */
        function submit() {
            $scope.transmit("save");
        }
        
        /**
         * Depending on flag, shows RDF to user or persists N3 to store.
         */
        function transmit(flag) {
            // @@@ rewire with services
            if ($scope.validate()) {
                if (flag === "export") {
                    $scope.exportRDF();
                } else if (flag === "save") {
                    $scope.exportN3($scope.persist);
                }
            } else {
                alert("Please fill out all required properties before " + ((flag === "save") ? "saving" : "exporting") + ".");
            }
        }

        /**
         * Checks $scope current work for whether mandatory-ness is met.
         * @@@arguments
         */
        function validate() {
            // @@@ redo with new services, etc.
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
        }

        /**
         * Takes N3 string and persists it to backing store.
         * @@@error handling
         */
        function persist() {
            Store.new(null, {"n3": n3}).$promise.then(function(resp) {
                // console.log(resp);
            });
        }

        /**
         * Open modal dialog to show (stored) string to user.
         * @@@arguments, service?
         */
        function showRDF() {
            // @@@ update
            $modal.open({
                templateUrl: "export.html",
                controller: "ExportController",
                windowClass: "export",
                resolve: {
                    rdf: function() {
                        return $scope.exportedRDF;
                    }
                }
            });
        }
    }
})();
