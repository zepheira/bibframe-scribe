angular.module("resolverService", ["ngResource"]).
    factory("Resolver", function($resource) {
        return $resource(
            "../resolver?r=:uri",
            {},
            {
                "resolve": {
                    "method": "GET",
                    "headers": { "Accept": "application/rdf+xml,text/rdf+n3" },
                    "transformResponse": function(data) {
                        return { "raw": data }; 
                    },
                    "isArray": false
                }
            }
        );
    }
);
