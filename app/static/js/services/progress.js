(function() {
    "use strict";

    angular
        .module("progressService", [])
        .factory("Progress", ["$rootScope", Progress]);

    function Progress($scope) {
        var service, _current, _progress, _total;

        var service = {
            setTotal: setTotal,
            getCurrent: getCurrent,
            increment: increment
        };

        _current = 0;
        _progress = 0;
        _total = 0;

        return service;

        function setTotal(t) {
            _total = t;
        }

        function getCurrent() {
            return _progress;
        }

        function increment() {
            $scope.$evalAsync(function() {
                _progress = Math.round((++_current / _total) * 100);
            });
        }
    }
})();
