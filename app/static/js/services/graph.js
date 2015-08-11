(function() {
    angular
        .module("graphService", [])
        .factory("Graph", ["$q", "Message", "TemplateStore", "Progress", Graph]);

    function Graph($q, Message, TemplateStore, Progress) {
        var service, _store, SCHEMAS;

        SCHEMAS = "urn:schema";
        DATA = "urn:data";
        BF = "http://bibfra.me/vocab/lite/";

        service = {
            getStore: getStore,
            load: loadSchema,
            loadResource: loadResource,
            execute: execute,
            SCHEMAS: SCHEMAS,
            DATA: DATA
        };

        _store = rdfstore.create();
        _store.registerDefaultProfileNamespaces();

        return service;

        function getStore() {
            return _store;
        }

        function loadSchema(config, n3, url) {
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

        function loadResource(resource, n3) {
            var deferred = $q.defer();
            _store.load("text/turtle", n3, DATA, function(success) {
                if (!success) {
                    Message.addMessage("Error loading data, please check RDF validity", "danger");
                    deferred.reject();
                } else {
                    deferred.resolve();
                }
            });
            return deferred.promise;
        }

        /**
         * Retrieve relation.
         */
        function getRelation(res) {
            var relation, result, query;
            result = $q.defer();
            relation = res._template.getRelation();
            if (relation !== null) {
                query = "SELECT ?r WHERE { <" + res.getID() + "> <" + BF + relation + "> ?r }";
                execute(res, query, DATA).then(function(results) {
                    result.resolve(results[1]);
                });
            } else {
                result.reject();
            }
            return result.promise;
        }

        function execute(res, query, graph) {
            var deferred = $q.defer();
            if (typeof graph === "undefined") {
                graph = SCHEMAS;
            }
            _store.execute(query, [graph], [], function(success, results) {
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
