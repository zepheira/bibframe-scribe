(function() {
    angular
        .module("storeService", ["ngResource"])
        .factory("Store", Store);

    function Store($resource) {
        return $resource(
            "../resource/:action",
            {},
            {
                "id": {
                    "method": "POST",
                    "isArray": true,
                    "params": {
                        "action": "id"
                    }
                },
                "get": {
                    "method": "GET",
                    "isArray": false,
                    "params": {
                        "action": "get",
                        "s": "@s"
                    }
                },
                "query": {
                    "method": "GET",
                    "isArray": true,
                    "params": {
                        "action": "query",
                        "s": "@s",
                        "p": "@p",
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
})();
