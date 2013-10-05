var ResourceTemplate = function(obj) {
    this._maxOccurs = 1;
    this._minOccurs = 0;
    this._id = null;
    this._classID = null;

    if (typeof obj.minOccurs !== "undefined") {
        this._minOccurs = obj.minOccurs;
    }

    if (typeof obj.maxOccurs !== "undefined") {
        this._maxOccurs = obj.maxOccurs;
    }

    if (typeof obj.id !== "undefined") {
        this._id = obj.id;
    }

    if (typeof obj.class !== "undefined") {
        if (typeof obj.class.id !== "undefined") {
            this._classID = obj.class.id;
        }
        console.log(obj.class);
    }
};

ResourceTemplate.prototype.getID = function() {
    return this._id;
};

ResourceTemplate.prototype.getClassID = function() {
    return this._classID;
};

ResourceTemplate.prototype.isOptional = function() {
    if (typeof this._minOccurs === "number" && this._minOccurs === 0) {
        return true;
    } else {
        return false;
    }
};

ResourceTemplate.prototype.getMinOccurs = function() {
    return this._minOccurs;
};

ResourceTemplate.prototype.isRequired = function() {
    if (typeof this._minOccurs === "number" && this._minOccurs > 0) {
        return true;
    } else {
        return false;
    }
};

ResourceTemplate.prototype.getMaxOccurs = function() {
    return this._maxOccurs;
};
