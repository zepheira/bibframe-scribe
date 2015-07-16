(function() {
    angular
        .module("configurationService", [])
        .factory("Configuration", ["$http", "$q", "ConfigurationLoad", "ProfileLoad", "Progress", "Message", "Graph", "ResourceStore", "TemplateStore", "Profile", Configuration]);

    function Configuration($http, $q, ConfigurationLoad, ProfileLoad, Progress, Message, Graph, ResourceStore, TemplateStore, Profile) {
        var service, _config, _firstClass, _initialized, _resourceOptions, _services;

        service = {
            getConfig: getConfig,
            getFirstClass: getFirstClass,
            getResourceOptions: getResourceOptions,
            initialize: initialize,
            isInitialized: isInitialized
        };

        _initialized = false;
        _resourceOptions = [];
        // @@@ take out of page and put here?
        _services = {};

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

        function initialize() {
            ConfigurationLoad.get(null, null).$promise.then(function(config) {
                var total, current;
                
                _config = config;
                _firstClass = _config.firstClass;
                
                Progress.setTotal((_config.schemas.length*2) + _config.profiles.length);
                
                return $q.all(_config.schemas.map(function(s) {
                    Progress.increment();
                    return $http.get('schema/' + s);
                })).then(function(httpResponses) {
                    httpResponses.map(function(response) {
                        Graph.load(_config, response.data, response.config.url);
                    });
                }, function(fail) {
                    Message.addMessage('Failed to load schema ' + fail.config.url + ': HTTP ' + fail.status + ' - ' + fail.statusText, 'danger');
                }).then(function() {
                    Graph.registerNamespaces();
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
                                if (TemplateStore.hasTemplateByClassID(template.getRelation())) {
                                    relation = TemplateStore.getTemplateByClassID(template.getRelation());
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
                        ResourceStore.clear();
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
            angular.forEach(_config.resourceServiceMap, function(item, key) {
                TemplateStore.addResourceType(key, item);
            });

            angular.forEach(_config.dataTypes, function(dataType) {
                ResourceStore.addDataTypeHandler(dataType.id, dataType.handler);
            });

            return resources;       
        }
    }
})();
