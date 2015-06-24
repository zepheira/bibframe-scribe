(function() {
    "use strict";

    angular
        .module("progressService", [])
        .factory("Progress", Progress);

    function Progress() {
        var service = {
            setTotal: setTotal,
            getCurrent: getCurrent,
            increment: increment
        };

        this._current = 0;
        this._progress = 0;
        this._total = 0;

        return service;

        function setTotal(t) {
            this._total = t;
        }

        function getCurrent() {
            return this._progress;
        }

        function increment() {
            this._progress = Math.round((++this._current / this._total) * 100);
        }
    }
})();
