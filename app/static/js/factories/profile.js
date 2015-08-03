(function() {
    angular
        .module("profileFactory", [])
        .factory("Profile", ["$q", "ResourceTemplate", "Graph", ProfileFactory]);

    function ProfileFactory($q, ResourceTemplate, Graph) {

        function Profile(id) {
            this._id = id;
            this._resourceTemplates = {};
            this._idToTemplate = {};
            this._classMap = {};
        }

        Profile.prototype.init = function(obj, config) {
            var rt, i, template, work, query,
            promises = [],
            prof = this,
            deferred = $q.defer();
            if (typeof obj.resourceTemplate !== "undefined") {
                for (i = 0; i < obj.resourceTemplate.length; i++) {
                    template = obj.resourceTemplate[i];
                    rt = new ResourceTemplate(template, config);
                    this._resourceTemplates[rt.getClassID()] = rt;
                    this._idToTemplate[rt.getID()] = rt;
                    
                    query = 'SELECT ?o { <'+rt.getClassID()+'> rdfs:subClassOf ?o }';
                    promises.push(Graph.execute(rt, query));
                }
            }
            $q.all(promises).then(function(results) {
                results.map(function(r) {
                    prof._processQuery(config.firstClass, r);
                });
                deferred.resolve();
            });
            return deferred.promise;
        };
        
        Profile.prototype._processQuery = function(classes, results) {
            var i, fc, rt;
            for (i = 0; i < results[1].length; i++) {
                fc = results[0].getFirstClass(classes, results[1][i].o.value);
                if (fc !== null) {
                    if (typeof this._classMap[fc] === "undefined") {
                        this._classMap[fc] = [results[0]];
                    } else {
                        this._classMap[fc].push(results[0]);
                    }
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
            } else {
                return null;
            }
        };
        
        Profile.prototype.getClassTemplates = function(clss) {
            if (typeof this._classMap[clss] !== "undefined") {
                return this._classMap[clss];
            } else {
                return null;
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

        return Profile;
    }
})();
