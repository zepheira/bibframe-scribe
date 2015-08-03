(function() {
    angular
        .module("configurationLoadService", ["ngResource"])
        .factory("ConfigurationLoad", ConfigurationLoad);

    function ConfigurationLoad($resource) {
        return $resource(
            "./config.json",
            {},
            {
                "get": { "method": "GET", "isArray": false }
            }
        );
    }
})();
