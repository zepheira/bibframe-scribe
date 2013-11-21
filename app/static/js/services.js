angular.module("profileServices", ["ngResource"]).
    factory("Profiles", function($resource) {
        return $resource(
            "./profiles/:profile.:format",
            {
                "profile": "@profile",
                "format": "@format"
            },
            {
                "get": { "method": "GET", "isArray": false }
            }
        );
    }
);

angular.module("configurationServices", ["ngResource"]).
    factory("Configuration", function($resource) {
        return $resource(
            "./config.json",
            {},
            {
                "get": { "method": "GET", "isArray": false }
            }
        );
    }
);

angular.module("storeService", ["ngResource"]).
    factory("Store", function($resource) {
        return $resource(
            "/resource/:action",
            {},
            {
                "id": {
                    "method": "POST",
                    "isArray": false,
                    "params": {
                        "action": "id"
                    }
                },
                "new": {
                    "method": "PUT",
                    "isArray": false,
                    "params": {
                        "action": "new",
                        "n3": "@n3"
                    }
                }
            }
        );
    }
);

angular.module("queryService", ["ngResource"]).
    factory("Query", function($resource) {
        return $resource(
            "/suggest/local?q=:q",
            {},
            {
                "suggest": { "method": "GET", "isArray": true }
            }
        );
    }
);

// Raw authority services, not meant to be ultimately utilized in this fashion
// Combine with Query above
angular.module("authorityServices", ["ngResource"]).
    factory("Authorities", function($resource) {
        return $resource(
            "/suggest/:service?q=:q&branch=:branch",
            {
                "service": "@service",
                "branch": "@branch"
            },
            {
                "suggest": { "method": "GET", "isArray": true }
            }
        );
    }
);
