(function() {
    angular
        .module("templateStoreService", [])
        .factory("TemplateStore", TemplateStore);

    function TemplateStore() {
        var service, _resourceToFirstClassMap, _resourceTemplates, _resourceTypes, _typeMap, _idToTemplate, _profiles;

        service = {
            addResourceFirstClass: addResourceFirstClass,
            addResourceTemplate: addResourceTemplate,
            hasTemplateByClassID: hasTemplateByClassID,
            getTemplateByClassID: getTemplateByClassID,
            hasTemplateByID: hasTemplateByID,
            getTemplateByID: getTemplateByID,
            getTemplateIDHash: getTemplateIDHash,
            addResourceType: addResourceType,
            addProfile: addProfile
        };

        _resourceToFirstClassMap = {};
        _resourceTemplates = {};
        _resourceTypes = {};
        _typeMap = {};
        _idToTemplate = {};
        _profiles = [];

        return service;

        function addResourceFirstClass(res, fc) {
            _resourceToFirstClassMap[res] = fc;
        }

        function addResourceTemplate(template) {
            _resourceTemplates[template.getClassID()] = template;
        }

        function hasTemplateByClassID(id) {
            return typeof _resourceTemplates[id] !== "undefined";
        }

        function getTemplateByClassID(id) {
            return _resourceTemplates[id];
        }

        function hasTemplateByID(id) {
            return typeof _idToTemplate[id] !== "undefined";
        }

        function getTemplateByID(id) {
            return _idToTemplate[id];
        }

        function getTemplateIDHash() {
            return _idToTemplate;
        }

        function getReferenceResourceType(ref) {
            _resourceTypes[_idToTemplate[uri].getClassID()]
        }

        function addResourceType(uri, type) {
            if (typeof type === "string") {
                _resourceTypes[uri] = type;
            } else {
                _resourceTypes[uri] = type.type;
                _typeMap[type.type] = type.propertyMap;
            }
        }

        function addProfile(profile) {
            _profiles.push(profile);
        }
    }

    
})();
