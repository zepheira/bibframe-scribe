(function() {
    angular
        .module("schemasService", [])
        .factory("Schemas", ["$http", Schemas]);

    function Schemas($http) {
        var service;

        service = {
            get: get
        };

        return service;

        function get(schema) {
            return $http.get('./schema/' + schema);
        }
    }
})();
