(function() {
    "use strict";

    angular
        .module("schemasService", ["ngResource"])
        .factory("Schemas", Schemas);

    function Schemas($resource) {
        var service;

        service = {
            get: get
        };

        return service;

        function get(schema) {
            return $http.get('./schema/' + s);
        }
    }
})();
