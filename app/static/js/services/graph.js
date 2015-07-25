(function() {
    angular
        .module("graphService", [])
        .factory("Graph", ["$q", "Message", "TemplateStore", "Progress", Graph]);

    function Graph($q, Message, TemplateStore, Progress) {
        var service, _store, SCHEMAS;

        SCHEMAS = "urn:schema";

        service = {
            getStore: getStore,
            load: load,
            execute: execute,
            SCHEMAS: SCHEMAS
        };

        _store = rdfstore.create();
        _store.registerDefaultProfileNamespaces();

        return service;

        function getStore() {
            return _store;
        }

        function load(config, n3, url) {
            var deferred = $q.defer();
            _store.load("text/turtle", n3, SCHEMAS, function(success) {
                if (!success) {
                    Message.addMessage("Error loading schema " + url + ", please check RDF validity", "danger");
                    deferred.reject();
                } else {
                    angular.forEach(config.firstClass, function(fc) {
                        var query = "SELECT ?s WHERE { ?s rdfs:subClassOf <" + fc + "> }";
                        _store.execute(query, [SCHEMAS], [], function(success, results) {
                            if (success) {
                                angular.forEach(results, function(r) {
                                    TemplateStore.addResourceFirstClass(r.s.value, fc);
                                });
                                deferred.resolve();
                            } else {
                                deferred.reject();
                            }
                        });
                    });
                    Progress.increment();
                }
            });
            return deferred.promise;
        }

        function execute(res, query) {
            var deferred = $q.defer();
            _store.execute(query, [SCHEMAS], [], function(success, results) {
                if (success) {
                    deferred.resolve([res, results]);
                } else {
                    deferred.reject("Query failed: " + query);
                }
            });
            return deferred.promise;
        }
        
    }
})();
