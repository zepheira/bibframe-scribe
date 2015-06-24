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
