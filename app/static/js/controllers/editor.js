(function() {
    angular
        .module("bibframeEditor")
        .controller("EditorController", ["$scope", "$modal", "$log", "Store", "Configuration", "Query", "Graph", "Message", "Resolver", "Namespace", "Progress", "Property", "PredObject", "ValueConstraint", "PropertyTemplate", "ResourceTemplate", "Resource", "Profile", "ResourceStore", "TemplateStore", EditorController]);

    function EditorController($scope, $modal, $log, Store, Configuration, Query, Graph, Message, Resolver, Namespace, Progress, Property, PredObject, ValueConstraint, PropertyTemplate, ResourceTemplate, Resource, Profile, ResourceStore, TemplateStore) {
        // @@@ fix any data still on $scope
        $scope.inputted = {};
        $scope.useServices = {};
        $scope.editExisting = false; // @@@ redo this, used as a signal
        $scope.pivoting = false;
        $scope.popover = {
            "uri": null,
            "data": null
        };

        $scope.newEdit = newEdit;
        $scope.autocomplete = autocomplete;
        $scope.setValueFromInput = setValueFromInput;
        $scope.reset = reset;
        $scope.selectValue = selectValue;
        $scope.editLiteral = editLiteral;
        $scope.editResource = editResource;
        $scope.popoverResource = popoverResource;
        $scope.showResource = showResource;
        $scope.pivot = pivot;
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
        $scope.current = ResourceStore.getCurrent;
        $scope.created = ResourceStore.getCreated;
        $scope.addCreated = ResourceStore.addCreated;
        $scope.cacheDropzone = ResourceStore.cacheDropzone;
        $scope.config = Configuration.getConfig;
        $scope.getTemplateByID = TemplateStore.getTemplateByID;
        $scope.getTemplateByClassID = TemplateStore.getTemplateByClassID;
        $scope.hasRequired = ResourceStore.hasRequired;
        $scope.setHasRequired = ResourceStore.setHasRequired;
        $scope.isLoading = ResourceStore.isLoading;
        $scope.getReferenceResourceType = TemplateStore.getReferenceResourceType;
        $scope.getTypeProperties = TemplateStore.getTypeProperties;
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
            ResourceStore.getCurrent().setTemplate(TemplateStore.getTemplateByClassID(resource.uri));
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

            ResourceStore.setLoading(property.getProperty().getID(), true);
            return Query.suggest({"q": typed, "services": JSON.stringify(filtered.sort())}).$promise.then(function(res) {
                ResourceStore.setLoading(property.getProperty().getID(), false);
                return res;
            });
        }

        /**
         * Fires when a dropdown item is selected
         * @@@ service? - with autocomplete?
         */
        function selectValue(property, selection, created) {
            var seen = false, objType;
            objType = property.getType();
            angular.forEach(ResourceStore.getCurrent().getPropertyValues(property), function(val) {
                if (selection.uri === val.getValue()) {
                    seen = true;
                }
            });
            if (typeof created === "undefined") {
                created = false;
            }
            if (!seen) {
                ResourceStore.getCurrent().addPropertyValue(property, new PredObject(selection.label, selection.uri, objType, created));
            }
        }

        /**
         * Convenience method
         * @@@ rewrite to do without $scope
         */
        function setValueFromInput(prop, inputs) {
            if (!$scope.editExisting) {
                ResourceStore.getCurrent().addPropertyValue(prop, inputs[prop.getProperty().getID()]);
                inputs[prop.getProperty().getID()] = '';
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
        function editLiteral(property, value) {
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
                    ResourceStore: function() {
                        return ResourceStore;
                    }
                }
            });

            modal.result.then(function(newValue) {
                var objs, target, mod;
                objs = ResourceStore.getCurrent().getPropertyValues(property.getProperty().getID());
                angular.forEach(objs, function(obj, idx) {
                    if (obj.getValue() === value.getValue()) {
                        target = idx;
                    };
                });
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
                if (val.getID() === value.getValue()) {
                    toEdit = val;
                }
            });

            pivot(property, null, toEdit);
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
            var modal, res, doInit;

            if (typeof toEdit === "undefined") {
                if (typeof ref === "undefined") {
                    ref = property.getConstraint().getReference();
                }

                res = TemplateStore.getTemplateByID(ref);

                toEdit = new Resource(Configuration.getConfig().idBase, res);
                doInit = true;
            } else {
                res = toEdit.getTemplate();
                doInit = false;
            }

            ResourceStore.pivot(toEdit);

            modal = $modal.open({
                templateUrl: "pivot.html",
                controller: "SubResourceController",
                windowClass: "pivot",
                scope: $scope,
                resolve: {
                    template: function() {
                        return res;
                    },
                    doInitialization: function() {
                        return doInit;
                    }
                }
            });
            
            modal.result.then(function() {
                var r = ResourceStore.pivotDone();
                selectValue(property, {"label": "[created]", "uri": r.getID()}, true);
            }, function() {
                ResourceStore.pivotDone();
            });
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
            transmit("save");
        }
        
        /**
         * Depending on flag, shows RDF to user or persists N3 to store.
         */
        function transmit(flag) {
            if (validate()) {
                if (flag === "export") {
                    showRDF();
                } else if (flag === "save") {
                    persist(ResourceStore.getCurrent().toN3(ResourceStore.getCreated()));
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
            var props, valid;
            props = ResourceStore.getActiveTemplate().getPropertyTemplates();
            valid = true;
            angular.forEach(props, function(prop) {
                if (prop.isRequired() && ResourceStore.getCurrent().getPropertyValues(prop.getProperty().getID()).length === 0) {
                    valid = false;
                }
            });
            return valid;
        }

        /**
         * Takes N3 string and persists it to backing store.
         * @@@error handling
         */
        function persist(n3) {
            Store.new(null, {"n3": n3}).$promise.then(function(resp) {
                // console.log(resp);
            });
        }

        /**
         * Open modal dialog to show (stored) string to user.
         * @@@arguments, service?
         */
        function showRDF() {
            $modal.open({
                templateUrl: "export.html",
                controller: "ExportController",
                windowClass: "export",
                resolve: {
                    rdf: function() {
                        return ResourceStore.getCurrent().toRDF(ResourceStore.getCreated());
                    }
                }
            });
        }
    }
})();
