var ValueConstraint = function(obj) {
    this._ref = null;
    this._lang = null;
    this._type = null;
    this._typeID = null;
    this._typeLabel = null;
    this._typeLabelHint = null;

    if (typeof obj.descriptionTemplateRef !== "undefined") {
        this._ref = obj.descriptionTemplateRef;
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
};

ValueConstraint.prototype.hasReference = function() {
    return (this._ref !== null && this._ref !== "");
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

ValueConstraint.prototype.getComplexTypeLabelHint = function() {
    return this._typeLabelHint;
};
