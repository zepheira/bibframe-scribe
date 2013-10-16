var Profile = function(id, obj) {
    var rt, i, template;

    this._id = id;
    this._resourceTemplates = {};
    this._idToTemplate = {};

    if (typeof obj.resourceTemplate !== "undefined") {
        for (i = 0; i < obj.resourceTemplate.length; i++) {
            template = obj.resourceTemplate[i];
            rt = new ResourceTemplate(template);
            this._resourceTemplates[rt.getClassID()] = rt;
            this._idToTemplate[rt.getID()] = rt;
        }
    }
};

Profile.prototype.getID = function() {
    return this._id;
};

Profile.prototype.getResourceTemplate = function(id) {
    if (typeof this._resourceTemplates[id] !== "undefined") {
        return this._resourceTemplates[id];
    } else {
        return null;
    }
};

Profile.prototype.getTemplateByID = function(id) {
    if (typeof this._idToTemplate[id] !== "undefined") {
        return this._idToTemplate[id];
    }
};

Profile.prototype.registerResourceTemplates = function(map) {
    var id;
    for (id in this._resourceTemplates) {
        if (this._resourceTemplates.hasOwnProperty(id)) {
            map[this._resourceTemplates[id].getID()] = this._resourceTemplates[id];
        }
    }
};
