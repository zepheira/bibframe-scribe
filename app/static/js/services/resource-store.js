(function() {
    angular
        .module("resourceStoreService", [])
        .factory("ResourceStore", ["Resource", ResourceStore]);

    function ResourceStore(Resource) {
        var service, _current, _created, _loading, _flags, _hasRequired, _cache, _dataTypes;
        service = {
            getCurrent: getCurrent,
            getFlags: getFlags,
            getCreated: getCreated,
            setActiveTemplate: setActiveTemplate,
            getActiveTemplate: getActiveTemplate,
            getDataTypes: getDataTypes,
            setLoading: setLoading,
            getAllLoading: getAllLoading,
            isLoading: isLoading,
            hasRequired: hasRequired,
            setHasRequired: setHasRequired,
            setDirty: setDirty,
            addDataTypeHandler: addDataTypeHandler,
            newResource: newResource,
            setResourceTemplate: setResourceTemplate,
            reset: reset,
            clear: clear
        };

        _current = null;
        _activeTemplate = null;
        _dataTypes = {};
        _created = [];
        _loading = {};
        _flags = {
            isDirty: false
        };
        _hasRequired = false;
        _cache = {
            dz: null
        };

        return service;

        function getCurrent() {
            return _current;
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

        function getDataTypes() {
            return _dataTypes;
        }

        function getDataTypeByID(id) {
            return _dataTypes[id];
        }

        function setLoading(prop, loading) {
           _loading[prop] = loading;
        }

        function getAllLoading() {
            return _loading;
        }

        function isLoading(prop) {
            return _loading[prop];
        }

        function hasRequired() {
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

        function addDataTypeHandler(id, handler) {
            _dataTypes[id] = handler;
        }

        function newResource() {
            // @@@ ID generating service
            _current = new Resource("@@@");
        }

        function setResourceTemplate(tmpl) {
            _current.setTemplate(tmpl);
        }

        function reset() {
            _current.reset();
            _flags.isDirty = false;
            if (_cache.dz) {
                _cache.dz.removeAllFiles();
            }
        }

        function clear() {
            _hasRequired = false;
            _flags = {
                isDirty: false
            };
            _loading = {};
            if (_cache.dz !== null) {
                _cache.dz.destroy();
                _cache.dz = null;
            }
            newResource();
        }
    }
})();
