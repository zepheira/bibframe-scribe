(function() {
    angular
        .module("resourceStoreService", [])
        .factory("ResourceStore", ["Resource", ResourceStore]);

    function ResourceStore(Resource) {
        var service, _current, _created, _loading, _flags, _hasRequired, _cache, _dataTypes, _idbase;
        service = {
            getCurrent: getCurrent,
            getFlags: getFlags,
            getCreated: getCreated,
            addCreated: addCreated,
            setActiveTemplate: setActiveTemplate,
            getActiveTemplate: getActiveTemplate,
            getDataTypes: getDataTypes,
            getDataTypeByID: getDataTypeByID,
            setLoading: setLoading,
            getAllLoading: getAllLoading,
            isLoading: isLoading,
            hasRequired: hasRequired,
            setHasRequired: setHasRequired,
            addDataTypeHandler: addDataTypeHandler,
            newResource: newResource,
            setResourceTemplate: setResourceTemplate,
            cacheDropzone: cacheDropzone,
            reset: reset,
            clear: clear,
            setIDBase: setIDBase
        };

        _current = null;
        _activeTemplate = null;
        _dataTypes = {};
        _created = [];
        _loading = {};
        _flags = {};
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

        function addCreated(r) {
            _created.push(r);
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

        function isDirty() {
            return _flags.isDirty;
        }

        function setActiveTemplate(tmpl) {
            _activeTemplate = tmpl;
        }

        function addDataTypeHandler(id, handler) {
            _dataTypes[id] = handler;
        }

        function newResource() {
            _current = new Resource(_idbase);
        }

        function setResourceTemplate(tmpl) {
            _current.setTemplate(tmpl);
        }

        function cacheDropzone(dz) {
            _cache.dz = dz;
        }

        function reset() {
            _current.reset();
            if (_cache.dz) {
                _cache.dz.removeAllFiles();
            }
        }

        function clear() {
            _hasRequired = false;
            _flags = {};
            _loading = {};
            if (_cache.dz !== null) {
                _cache.dz.destroy();
                _cache.dz = null;
            }
            newResource();
        }

        function setIDBase(base) {
            _idbase = base;
        }
    }
})();
