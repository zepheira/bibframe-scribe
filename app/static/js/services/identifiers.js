(function() {
    angular
        .module("identifierService", [])
        .factory("Identifier", ["$http", "Store", Identifier]);

    function Identifier($http, Store) {
        var service, _cache, _remoteAvailable;

        service = {
            newIdentifier: newIdentifier
        }

        _cache = [];
        _remoteAvailable = true;

        return service;

        function newIdentifier(base) {
            var id;
            if (_cache.length > 0) {
                id = _cache.pop();
            } else {
                if (_remoteAvailable) {
                    _remote(10).then(function(resp) {
                        id = resp;
                    }, function() {
                        id = _local(base);
                    });
                } else {
                    id = _local(base);
                }
            }
            return id;
        }

        function _local(base) {
            return base + "/" + Math.floor(Math.random()*1000000);
        }

        function _remote(count) {
            return Store.id({}, {count: count}).$promise.then(function(resp) {
                _cache = _cache.concat(resp);
                return _cache.pop();
            }, function() {
                _remoteAvailable = false;
            });
        }
    }
})()
