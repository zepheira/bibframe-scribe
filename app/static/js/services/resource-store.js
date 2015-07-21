(function() {
    angular
        .module("resourceStoreService", [])
        .factory("ResourceStore", ["Resource", ResourceStore]);

    function ResourceStore(Resource) {
        var service, _current, _created, _loading, _flags, _hasRequired, _cache, _dataTypes, _idbase;
        service = {
            getCurrent: getCurrent,
            pivot: pivot,
            pivotDone: pivotDone,
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
        _parents = {
            current: [],
            loading: [],
            flags: [],
            hasRequired: []
        };
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

        function pivot(r) {
            _parents.current.push(_current);
            _parents.loading.push(_loading);
            _parents.flags.push(_flags);
            _parents.hasRequired.push(_hasRequired);
            _hasRequired = false;
            _flags = {};
            _loading = {};
            _current = r;
        }

        function pivotDone() {
            console.log('done');
            var ret = _current;
            addCreated(_current);
            _current = _parents.current.pop();
            _loading = _parents.loading.pop();
            _flags = _parents.flags.pop();
            _hasRequired = _parents.hasRequired.pop();
            return ret;
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
            if (typeof _loading[prop] !== "undefined") {
                return _loading[prop];
            } else {
                return false;
            }
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
