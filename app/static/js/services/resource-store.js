(function() {
    angular
        .module("resourceStoreService", [])
        .factory("ResourceStore", ["Resource", ResourceStore]);

    function ResourceStore(Resource) {
        var service, _current, _created, _cache, _dataTypes, _idbase;
        service = {
            getCurrent: getCurrent,
            setCurrent: setCurrent,
            pivot: pivot,
            pivotDone: pivotDone,
            getCreated: getCreated,
            addCreated: addCreated,
            setActiveTemplate: setActiveTemplate,
            getActiveTemplate: getActiveTemplate,
            getDataTypes: getDataTypes,
            getDataTypeByID: getDataTypeByID,
            setLoading: setLoading,
            addDataTypeHandler: addDataTypeHandler,
            newResource: newResource,
            setResourceTemplate: setResourceTemplate,
            getDropzone: getDropzone,
            cacheDropzone: cacheDropzone,
            reset: reset,
            clear: clear,
            setIDBase: setIDBase
        };

        _current = null;
        _parents = {
            current: []
        };
        _activeTemplate = null;
        _dataTypes = {};
        _created = [];
        _cache = {
            dz: null
        };

        return service;

        function getCurrent() {
            return _current;
        }

        function setCurrent(r) {
            _current = r;
        }

        function pivot(r) {
            _parents.current.push(_current);
            _current = r;
        }

        function pivotDone() {
            var ret = _current;
            addCreated(_current);
            _current = _parents.current.pop();
            return ret;
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
           _current.setLoading(prop, loading);
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

        function getDropzone() {
            return _cache.dz;
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
