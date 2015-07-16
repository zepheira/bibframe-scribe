(function() {
    angular
        .module("identifierService", [])
        .factory("Identifier", ["$http", "$q", "Store", Identifier]);

    function Identifier($http, $q, Store) {
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
                    _remote(10).then(function() {
                        id = newIdentifier(base);
                    }).catch(function() {
                        id = _local(base);
                    });
                } else {
                    id = _local(base);
                }
            }
            return id;
        }

        function _local(base) {
            return base + Math.floor(Math.random()*1000000);
        }

        function _remote(count) {
            var defer = $q.defer();
            Store.id({}, {count: count}).$promise.then(function(resp) {
                _cache = _cache.concat(resp);
                defer.resolve();
            }).catch(function() {
                _remoteAvailable = false;
                defer.reject();
            });
            return defer.promise;
        }
    }
})()
