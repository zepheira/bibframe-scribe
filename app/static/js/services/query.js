(function() {
    "use strict"

    angular
        .module("queryService", ["ngResource"])
        .factory("Query", Query);

    function Query($resource) {
        return $resource(
            "../suggest/master?q=:q&services=:services",
            {},
            {
                "suggest": { "method": "GET", "isArray": true }
            }
        );
    }
})();
