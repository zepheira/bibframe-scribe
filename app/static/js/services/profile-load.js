(function() {
    "use strict";

    angular
        .module("profileLoadService", ["ngResource"])
        .factory("ProfileLoad", ProfileLoad);

    function ProfileLoad($resource) {
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
