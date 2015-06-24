(function() {
    "use strict";

    angular
        .module("configurationService", ["ngResource"])
        .factory("Configuration", Configuration);

    function Configuration($resource) {
        return $resource(
            "./config.json",
            {},
            {
                "get": { "method": "GET", "isArray": false }
            }
        );
    }
})();
