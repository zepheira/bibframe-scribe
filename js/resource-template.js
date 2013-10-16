var ResourceTemplate = function(obj) {
    var i, pt, INSTANCE;

    INSTANCE = "http://bibframe.org/vocab/hasInstance";

    this._id = null;
    this._classLabel = null;
    this._classID = null;
    this._propertyTemplates = [];
    this._work = false;
    this._instanceRef = null;

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

        if (typeof obj.class.propertyTemplate !== "undefined") {
            for (i = 0; i < obj.class.propertyTemplate.length; i++) {
                pt = new PropertyTemplate(obj.class.propertyTemplate[i]);
                if (pt.getProperty().getID() === INSTANCE) {
                    this._work = true;
                    this._instanceRef = pt.getConstraint().getReference();
                } else {
                    this._propertyTemplates.push(pt);
                }
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

ResourceTemplate.prototype.getLabel = function() {
    return this._classLabel;
};

ResourceTemplate.prototype.isWork = function() {
    return this._work;
};

ResourceTemplate.prototype.getInstancesID = function() {
    return this._instanceRef;
};

ResourceTemplate.prototype.getPropertyTemplates = function() {
    return this._propertyTemplates;
};

ResourceTemplate.prototype.mergeWork = function(work) {
    this._propertyTemplates = work.getPropertyTemplates().concat(this._propertyTemplates);
};
