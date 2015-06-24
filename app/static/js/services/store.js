angular.module("storeService", ["ngResource"]).
    factory("Store", function($resource) {
        return $resource(
            "../resource/:action",
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
