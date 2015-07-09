(function() {
    angular
        .module("resourceTemplateFactory", [])
        .factory("ResourceTemplate", ["PropertyTemplate", ResourceTemplateFactory]);

    function ResourceTemplateFactory(PropertyTemplate) {

        function ResourceTemplate(obj, config) {
            var i, pt;
            
            this._id = null;
            this._classLabel = null;
            this._labelProperty = null;
            this._classID = null;
            this._propertyTemplates = [];
            this._relation = null;
            
            if (typeof obj.id !== "undefined") {
                this._id = obj.id;
            }
            
            if (typeof obj.class !== "undefined") {
                if (typeof obj.class.id !== "undefined") {
                    this._classID = obj.class.id;
                }
                
                if (typeof obj.class.classLabel !== "undefined") {
                    this._classLabel = obj.class.classLabel;
                }
                
                if (typeof obj.class.labelProperty !== "undefined") {
                    this._labelProperty = obj.class.labelProperty;
                }
                
                // @@@There could probably be a complex type around relations
                if (typeof config.relations !== "undefined") {
                    for (i in config.relations) {
                        if (typeof obj.class[i] !== "undefined") {
                            this._relation = obj.class[i];
                            break;
                        }
                    }
                }
                
                if (typeof obj.class.propertyTemplate !== "undefined") {
                    for (i = 0; i < obj.class.propertyTemplate.length; i++) {
                        pt = new PropertyTemplate(obj.class.propertyTemplate[i]);
                        this._propertyTemplates.push(pt);
                    }
                }
            }
        }
        
        ResourceTemplate.prototype.getID = function() {
            return this._id;
        };
        
        ResourceTemplate.prototype.getClassID = function() {
            return this._classID;
        };
        
        ResourceTemplate.prototype.getLabel = function() {
            return this._classLabel;
        };
        
        ResourceTemplate.prototype.getLabelProperty = function() {
            return this._labelProperty;
        };
        
        ResourceTemplate.prototype.getFirstClass = function(classes, superClass) {
            if (classes.indexOf(superClass) >= 0) {
                return superClass;
            } else if (classes.indexOf(this.getClassID()) >= 0) {
                return this.getClassID();
            } else {
                return null;
            }
        };

        ResourceTemplate.prototype.getPropertyTemplates = function() {
            return this._propertyTemplates;
        };
        
        ResourceTemplate.prototype.hasProperty = function(prop) {
            var i, iprop, result = false;
            for (i = 0; i < this._propertyTemplates.length; i++) {
                iprop = this._propertyTemplates[i];
                if (prop === iprop.getProperty().getID()) {
                    result = true;
                    break;
                }
            }
            return result;
        };
        
        ResourceTemplate.prototype.getRelation = function() {
            return this._relation;
        };
        
        ResourceTemplate.prototype.mergeTemplate = function(tmpl) {
            this._propertyTemplates = tmpl.getPropertyTemplates().concat(this._propertyTemplates);
        };

        return ResourceTemplate;
    }
})();
 
