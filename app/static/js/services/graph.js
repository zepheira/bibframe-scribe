(function() {
    angular
        .module("graphService", [])
        .factory("Graph", ["$q", "Message", "TemplateStore", "Progress", Graph]);

    function Graph($q, Message, TemplateStore, Progress) {
        var service, _store, SCHEMAS;

        SCHEMAS = "urn:schema";

        service = {
            load: load,
            registerNamespaces: registerNamespaces,
            execute: execute,
            SCHEMAS: SCHEMAS
        };

        _store = rdfstore.create();

        return service;

        function load(config, n3, url) {
            _store.load("text/turtle", n3, SCHEMAS, function(success) {
                Progress.increment();
                if (!success) {
                    Message.addMessage("Error loading schema " + url + ", please check of RDF validity", "danger");
                } else {
                    angular.forEach(config.firstClass, function(fc) {
                        var query = "SELECT ?s { ?s rdfs:subClassOf <" + fc + "> }";
                        _store.execute(query, [SCHEMAS], [], function(success, results) {
                            angular.forEach(results, function(r) {
                                TemplateStore.addResourceFirstClass(r.s.value, fc);
                            });
                        });
                    });
                }
            });
        }

        function registerNamespaces() {
            _store.registerDefaultProfileNamespaces();
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
