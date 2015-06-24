angular.module("queryService", ["ngResource"]).
    factory("Query", function($resource) {
        return $resource(
            "../suggest/master?q=:q&services=:services",
            {},
            {
                "suggest": { "method": "GET", "isArray": true }
            }
        );
    }
);
