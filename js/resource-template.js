var ResourceTemplate = function(obj) {
    var i;

    this._maxOccurs = 1;
    this._minOccurs = 0;
    this._repeatable = false;
    this._mandatory = false;
    this._id = null;
    this._classID = null;
    this._propertyTemplates = [];

    if (typeof obj.minOccurs !== "undefined") {
        this._minOccurs = obj.minOccurs;
    }

    if (typeof obj.maxOccurs !== "undefined") {
        this._maxOccurs = obj.maxOccurs;
    }

    if (typeof obj.repeatable !== "undefined") {
        this._repeatable = obj.repeatable;
    }

    if (typeof obj.mandatory !== "undefined") {
        this._mandatory = obj.mandatory;
    }

    if (typeof obj.id !== "undefined") {
        this._id = obj.id;
    }

    if (typeof obj.class !== "undefined") {
        if (typeof obj.class.id !== "undefined") {
            this._classID = obj.class.id;
        }

        if (typeof obj.class.propertyTemplate !== "undefined") {
            for (i = 0; i < obj.class.propertyTemplate.length; i++) {
                this._propertyTemplates.push(new PropertyTemplate(obj.class.propertyTemplate[i]));
            }
        }
    }
};

ResourceTemplate.prototype.getID = function() {
    return this._id;
};

ResourceTemplate.prototype.getClassID = function() {
    return this._classID;
};

ResourceTemplate.prototype.isOptional = function() {
    if ((typeof this._minOccurs === "number" && this._minOccurs === 0) || !this._mandatory) {
        return true;
    } else {
        return false;
    }
};

ResourceTemplate.prototype.getMinOccurs = function() {
    return this._minOccurs;
};

ResourceTemplate.prototype.isRequired = function() {
    if ((typeof this._minOccurs === "number" && this._minOccurs > 0) || this._mandatory) {
        return true;
    } else {
        return false;
    }
};

ResourceTemplate.prototype.getMaxOccurs = function() {
    return this._maxOccurs;
};

PropertyTemplate.prototype.isRepeatable = function() {
    return this._repeatable;
};

ResourceTemplate.prototype.getPropertyTemplates = function() {
    return this._propertyTemplates;
};
