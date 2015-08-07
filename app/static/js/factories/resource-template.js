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
            this._propertyToTemplate = {};
            this._relation = null;
            
            if (typeof obj.id !== "undefined") {
                this._id = obj.id;
            }
            
            if (typeof obj.class !== "undefined") {
                if (typeof obj.class.type !== "undefined") {
                    this._classID = obj.class.type;
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
                        this._propertyToTemplate[pt.getProperty().getID()] = pt;
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
            return (typeof this._propertyToTemplate[prop] !== "undefined");
        };

        ResourceTemplate.prototype.getPropertyByID = function(prop) {
            return this._propertyToTemplate[prop];
        };
        
        ResourceTemplate.prototype.getRelation = function() {
            return this._relation;
        };
        
        ResourceTemplate.prototype.mergeTemplate = function(tmpl) {
            var pts = tmpl.getPropertyTemplates(), rt;
            rt = this;
            this._propertyTemplates = pts.concat(this._propertyTemplates);
            angular.forEach(pts, function(pt) {
                rt._propertyToTemplate[pt.getProperty().getID()] = pt;  
            });
        };

        return ResourceTemplate;
    }
})();
 
