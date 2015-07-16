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
