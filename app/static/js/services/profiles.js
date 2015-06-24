(function() {
    "use strict";

    angular
        .module("profilesService", ["ngResource"])
        .factory("Profiles", Profiles);

    function Profiles($resource) {
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
})();
