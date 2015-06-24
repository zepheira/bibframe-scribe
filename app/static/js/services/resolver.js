(function() {
    "use strict";

    angular
        .module("resolverService", ["ngResource"])
        .factory("Resolver", Resolver);

    function Resolver($resource) {
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
})();
