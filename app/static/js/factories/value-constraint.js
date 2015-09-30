(function() {
    angular
        .module("valueConstraintFactory", [])
        .factory("ValueConstraint", ValueConstraintFactory);

    function ValueConstraintFactory() {

        function ValueConstraint(obj) {
            this._ref = null;
            this._lang = null;
            this._type = null;
            this._typeID = null;
            this._typeLabel = null;
            this._typeLabelHint = null;
            this._editable = true;
            this._defaultURI = null;
            this._defaultLiteral = null;

            if (typeof obj.descriptionTemplateRef !== "undefined") {
                this._ref = obj.descriptionTemplateRef;
                if (typeof this._ref === "object") {
                    if (this._ref.length === 1) {
                        this._ref = this._ref[0];
                    } else if (this._ref.length === 0) {
                        this._ref = null;
                    }
                }
            }
            
            if (typeof obj.valueLang !== "undefined") {
                this._lang = obj.valueLang;
            }
            
            if (typeof obj.valueDataType !== "undefined") {
                if (typeof obj.valueDataType !== "object") {
                    this._type = obj.valueDataType;
                }
                
                if (typeof obj.valueDataType === "object") {
                    if (typeof obj.valueDataType.id !== "undefined") {
                        this._typeID = obj.valueDataType.id;
                    }
                    
                    if (typeof obj.valueDataType.valueLabel !== "undefined") {
                        this._typeLabel = obj.valueDataType.valueLabel;
                    }
                    
                    if (typeof obj.valueDataType.valueLabelHint !== "undefined") {
                        this._typeLabelHint = obj.valueDataType.valueLabelHint;
                    }
                }
            }
            
            if (typeof obj.editable !== "undefined") {
                this._editable = (obj.editable.toLowerCase() === "true");
            }
            
            if (typeof obj.defaultURI !== "undefined") {
                this._defaultURI = obj.defaultURI;
            }
            
            if (typeof obj.defaultLiteral !== "undefined") {
                this._defaultLiteral = obj.defaultLiteral;
            }
        }
        
        ValueConstraint.prototype.hasReference = function() {
            return (this._ref !== null && this._ref !== "");
        };
        
        ValueConstraint.prototype.hasManyReferences = function() {
            return (this._ref !== null && this._ref !== "" && typeof this._ref === "object" && this._ref.length > 1);
        };
        
        ValueConstraint.prototype.getReference = function() {
            return this._ref;
        };
        
        ValueConstraint.prototype.hasLanguage = function() {
            return (this._lang !== null && this._lang !== "");
        };
        
        ValueConstraint.prototype.getLanguage = function() {
            return this._lang;
        };
        
        ValueConstraint.prototype.hasBasicType = function() {
            return (this._type !== null && this._type !== "");
        };
        
        ValueConstraint.prototype.getBasicType = function() {
            return this._type;
        };
        
        ValueConstraint.prototype.hasComplexType = function() {
            return (this._typeID !== null && this._typeID !== "");
        };
        
        ValueConstraint.prototype.getComplexTypeID = function() {
            return this._typeID;
        };
        
        ValueConstraint.prototype.getComplexTypeLabel = function() {
            return this._typeLabel;
        };
        
        ValueConstraint.prototype.hasHint = function() {
            return (typeof this._typeLabelHint !== "undefined" && this._typeLabelHint !== null && this._typeLabelHint !== "");
        };
        
        ValueConstraint.prototype.getComplexTypeLabelHint = function() {
            return this._typeLabelHint;
        };
        
        ValueConstraint.prototype.hasDefaultURI = function() {
            return this._defaultURI !== null;
        };
        
        ValueConstraint.prototype.hasDefaultLiteral = function() {
            return this._defaultLiteral !== null;
        };
        
        ValueConstraint.prototype.isEditable = function() {
            // Possibly further use this to validate vocab usage by
            // checking if defaultURI matches to type / defaultLiteral matches
            // to type. But right now just check if editable is false but no
            // default provided.
            return (this._editable || (!this._editable && !(this.hasDefaultURI() || this.hasDefaultLiteral())));
        };
        
        ValueConstraint.prototype.getDefaultURI = function() {
            return this._defaultURI;
        };
        
        ValueConstraint.prototype.getDefaultLiteral = function() {
            return this._defaultLiteral;
        };

        return ValueConstraint;
    }
})();
