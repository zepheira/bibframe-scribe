(function() {
    angular
        .module("resourceStoreService", ["resourceFactory"])
        .factory("ResourceStore", ResourceStore);

    function ResourceStore(Resource) {
        var service, _current, _inputted, _created, _loading, _flags, _hasRequired, _cache;
        service = {
            getCurrent: getCurrent,
            getFlags: getFlags,
            getCreated: getCreated,
            getActiveTemplate: getActiveTemplate,
            setLoading: setLoading,
            isLoading: isLoading,
            reset: reset
        };

        return service;

        _current = new Resource(); //@@@ be able to create a resource without and ID or a template...?
        _activeTemplate = null;
        _inputted = {};
        _created = [];
        _loading = {};
        _flags = {
            isDirty: false
        };
        _hasRequired = false;
        _cache = {
            dz: null
        };

        function getCurrent() {
            return _current;
        }

        function getInputted() {
            return _inputted;
        }

        function getFlags() {
            return _flags;
        }

        function getCreated() {
            return _created;
        }

        function getActiveTemplate() {
            return _activeTemplate;
        }

        function setLoading(prop, loading) {
           _loading[prop] = loading;
        }

        function isLoading(prop) {
            return _loading[prop];
        }

        function getHasRequired() {
            return _hasRequired;
        }

        function setHasRequired(req) {
            _hasRequired = req;
        }

        function setDirty() {
            _flags.isDirty = true;
        };

        function setActiveTemplate(tmpl) {
            _activeTemplate = tmpl;
        }

        function reset() {
            _current.reset();
            _flags.isDirty = false;
            if ($scope.cache.dz) {
                $scope.cache.dz.removeAllFiles();
            }
            _inputted = {};
        }

        function clear() {
            _currentWork = new Resource();
            _hasRequired = false;
            _flags = {
                isDirty: false
            };
            _loading = {};
            if (_cache.dz !== null) {
                _cache.dz.destroy();
                _cache.dz = null;
            }
        }
    }
})();
