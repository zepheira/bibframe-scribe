(function() {
    angular
        .module("configurationService", [])
        .factory("Configuration", ["$q", "$location", "ConfigurationLoad", "ProfileLoad", "Progress", "Message", "Graph", "ResourceStore", "TemplateStore", "Profile", "Schemas", Configuration]);

    function Configuration($q, $location, ConfigurationLoad, ProfileLoad, Progress, Message, Graph, ResourceStore, TemplateStore, Profile, Schemas) {
        var service, _config, _firstClass, _initialized, _resourceOptions, _services, _args;

        service = {
            getConfig: getConfig,
            getFirstClass: getFirstClass,
            getSearchServices: getSearchServices,
            getResourceOptions: getResourceOptions,
            initialize: initialize,
            isInitialized: isInitialized,
            editOnLoad: editOnLoad,
            editResource: editResource
        };

        _initialized = false;
        _resourceOptions = [];
        _services = {};
        _args = {};

        return service;

        function getConfig() {
            return _config;
        }

        function getFirstClass() {
            return _firstClass;
        }

        function getSearchServices() {
            return _services;
        }

        function getResourceOptions() {
            return _resourceOptions;
        }

        function isInitialized() {
            return _initialized;
        }

        function _parseArgs() {
            if (typeof $location.search()["edit"] !== "undefined") {
                _args.edit = $location.search()["edit"];
            }
        }

        function initialize() {
            _parseArgs();
            return ConfigurationLoad.get(null, null).$promise.then(function(config) {
                var total, current;
                
                _config = config;
                _firstClass = _config.firstClass;
                
                Progress.setTotal((_config.schemas.length*2) + _config.profiles.length);
                
                return $q.all(_config.schemas.map(function(s) {
                    Progress.increment();
                    return Schemas.get(s);
                })).then(function(httpResponses) {
                    httpResponses.map(function(response) {
                        // @@@ returns a promise, not doing anything with it...
                        Graph.load(_config, response.data, response.config.url);
                    });
                }, function(fail) {
                    Message.addMessage('Failed to load schema ' + fail.config.url + ': HTTP ' + fail.status + ' - ' + fail.statusText, 'danger');
                }).then(function() {
                    $q.all(_config.profiles.map(function(p) {
                        return ProfileLoad.get({}, {"profile": p, "format": "json"}).$promise.then(function(resp) {
                            var prof, promise;
                            prof = new Profile(p);
                            return prof.init(resp.Profile, _config).then(function() {
                                TemplateStore.addProfile(prof);
                                Progress.increment();
                                return initializeProfile(prof);
                            });
                        });
                    })).then(function(responses) {
                        // After all resources are registered, generate options
                        var resources, relation;
                        resources = [];
                        responses.map(function(curr) {
                            angular.forEach(curr, function(template) {
                                relation = null;
                                if (TemplateStore.hasTemplateByID(template.getRelation())) {
                                    relation = TemplateStore.getTemplateByID(template.getRelation());
                                    template.setRelationResourceTemplate(relation);
                                }
                                resources.push({
                                    "id": template.getID(),
                                    "uri": template.getClassID(),
                                    "label": template.getLabel(),
                                    "sortKey": ((relation !== null) ? relation.getLabel() + "-" : "") + template.getLabel(),
                                    "child": relation !== null
                                });
                                return template;
                            });
                        });

                        angular.forEach(_config.resourceMap, function(info, key) {
                            angular.forEach(info.classes, function(c) {
                                TemplateStore.addResourceType(c, key);
                            });
                        });
                        angular.forEach(_config.resourceDefinitions, function(info, key) {
                            TemplateStore.addResourceType(key, info);
                        });
                        angular.forEach(_config.services, function(info, key) {
                            _services[key] = info;
                        });

                        angular.forEach(_config.dataTypes, function(dataType) {
                            ResourceStore.addDataTypeHandler(dataType.id, dataType.handler);
                        });

                        ResourceStore.clear();
                        ResourceStore.setIDBase(_config.idBase);
                        _initialized = true;
                        _resourceOptions = resources;
                    });
                });
            });
        }

        function initializeProfile(profile) {
            var instances, instanceTemplate, resources;
            resources = [];

            angular.forEach(_firstClass, function(fc) {
                var templates;
                templates = profile.getClassTemplates(fc);
                if (templates !== null) {
                    angular.forEach(templates, function(template) {
                        resources.push(template);
                        TemplateStore.addResourceTemplate(template);
                    });
                }
            });
            profile.registerResourceTemplates(TemplateStore.getTemplateIDHash());

            return resources;       
        }

        function editOnLoad() {
            return (typeof _args.edit !== "undefined");
        }

        function editResource() {
            return _args.edit;
        }
    }
})();
