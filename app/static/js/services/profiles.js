(function() {
    "use strict";

    angular
        .module("profilesServices", ["ngResource"])
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
