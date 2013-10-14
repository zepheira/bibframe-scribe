var PropertyTemplate = function(obj) {
    var i;

    this._minOccurs = 0;
    this._maxOccurs = 1;
    this._type = "literal";
    this._property = null;
    this._constraint = null;

    if (typeof obj.minOccurs !== "undefined") {
        this._minOccurs = obj.minOccurs;
    }

    if (typeof obj.maxOccurs !== "undefined") {
        this._maxOccurs = obj.maxOccurs;
    }

    if (typeof obj.type !== "undefined") {
        this._type = obj.type;
    }

    if (typeof obj.property !== "undefined") {
        this._property = new Property(obj.property);
    }

    if (typeof obj.valueConstraint !== "undefined") {
        this._constraint = new ValueConstraint(obj.valueConstraint);
    }
};

PropertyTemplate.LITERAL = "literal";
PropertyTemplate.RESOURCE = "resource";

PropertyTemplate.prototype.isOptional = function() {
    if (typeof this._minOccurs === "number" && this._minOccurs === 0) {
        return true;
    } else {
        return false;
    }
};

PropertyTemplate.prototype.getMinOccurs = function() {
    return this._minOccurs;
};

PropertyTemplate.prototype.isRequired = function() {
    if (typeof this._minOccurs === "number" && this._minOccurs > 0) {
        return true;
    } else {
        return false;
    }
};

PropertyTemplate.prototype.getMaxOccurs = function() {
    return this._maxOccurs;
};

PropertyTemplate.prototype.isLiteral = function() {
    return this._type === PropertyTemplate.LITERAL;
};

PropertyTemplate.prototype.isResource = function() {
    return this._type === PropertyTemplate.RESOURCE;
};

PropertyTemplate.prototype.getType = function() {
    return this._type;
};

PropertyTemplate.prototype.getProperty = function() {
    return this._property;
};

PropertyTemplate.prototype.getConstraint = function() {
    return this._constraint;
};
