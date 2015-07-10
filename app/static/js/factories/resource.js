(function() {
    angular
        .module("resourceFactory", [])
        .factory("Resource", ["PredObject", "Namespace", ResourceFactory]);

    function ResourceFactory(PredObject, Namespace) {
        function Resource(id, tmpl) {
            this._id = id;
            this._template = tmpl;
            this._type = (typeof tmpl !== "undefined" && tmpl !== null) ? tmpl.getClassID() : null;
            this._properties = {};
            this._pristine = {};
        }

        /**
         * @@@ add a utility function to load a resource from the
         *     triple-store
         */
        Resource.fromGraph = function(store, uri) {
            var query = "SELECT *  FROM { <" + uri + "> ?p ?o }", r;
            r = new Resource(uri, null);
            store.execute(query, function(success, results) {
                if (success) {
                    console.log(results);
                }
            });
            return r;
        };

        /**
         * Return resource URI.
         */
        Resource.prototype.getID = function() {
                return this._id;
        };

        /**
         * Return resource URI.
         */
        Resource.prototype.getType = function() {
            return this._type;
        };

        Resource.prototype.setTemplate = function(tmpl) {
            this._template = tmpl;
            this._type = tmpl.getClassID();
        };
        
        /**
         * Initialize hash for new property in resource.
         */
        Resource.prototype.initializeProperty = function(property, flags) {
            var prop, constraint, defaultVal;
            prop = property.getProperty().getID();
            if (typeof this._properties[prop] === "undefined") {
                this._properties[prop] = [];
                this._pristine[prop] = [];
            }
            if (property.hasConstraint()) {
                constraint = property.getConstraint();
                if (constraint.hasDefaultURI()) {
                    if (constraint.hasDefaultLiteral()) {
                        defaultVal = new PredObject(constraint.getDefaultLiteral(), constraint.getDefaultURI(), property.getType(), false);
                    } else {
                        defaultVal = new PredObject(constraint.getDefaultURI(), constraint.getDefaultURI(), property.getType(), false);
                    }
                    this._properties[prop].push(defaultVal);
                    this._pristine[prop].push(defaultVal);
                } else if (property.getConstraint().hasDefaultLiteral()) {
                    defaultVal = new PredObject(constraint.getDefaultLiteral(), null, property.getType(), false);
                    this._properties[prop].push(defaultVal);
                    this._pristine[prop].push(defaultVal);
                }
            }
            if (!flags.hasRequired && property.isRequired()) {
                flags.hasRequired = true;
            }
            flags.loading[prop] = false;
        };

        /**
         * Return property values based on the property URI.
         */
        Resource.prototype.getPropertyValues = function(property) {
            if (typeof this._properties[property] !== "undefined") {
                return this._properties[property];
            } else {
                return null;
            }
        }
        
        /**
         * Set work's value of property to String or Date value.
         * Returns true if it makes a change in the model, false if not.
         */
        Resource.prototype.addPropertyValue = function(property, value) {
            var propID, seen, val, isDirty, textValue;
            isDirty = false;
            if (typeof property === "string") {
                propID = property;
            } else {
                propID = property.getProperty().getID();
            }
            objType = property.getType();
            seen = false;
            if (typeof value === "object" && typeof value.toISOString !== "undefined") {
                textValue = value.toISOString().split("T")[0];
            } else {
                textValue = value;
            }
            angular.forEach(this._properties[propID], function(val) {
                if (val.getValue() === textValue) {
                    seen = true;
                }
            });
            if (!seen && textValue !== "") {
                isDirty = true;
                val = new PredObject(textValue, textValue, objType, true);
                if (property.hasConstraint() && property.getConstraint().hasComplexType()) {
                    val.setDatatype(property.getConstraint().getComplexTypeID());
                };
                this._properties[propID].push(val);
            }
            return isDirty;
        };
        
        /**
         * Delete a value for a work's property, return whether a change
         * in the model occurred or not.
         */
        Resource.prototype.removePropertyValue = function(property, value) {
            var prop, empty, objs, rmIdx, objVal;
            removed = false;
            if (typeof property === "string") {
                prop = property;
            } else {
                prop = property.getProperty().getID();
            }
            if (typeof value === "string") {
                objVal = value;
            } else {
                objVal = value.getValue();
            }
            objs = this._properties[prop];
            rmIdx = -1;
            angular.forEach(objs, function(obj, idx) {
                if (objVal === obj.getValue()) {
                    rmIdx = idx;
                }
            });
            if (rmIdx >= 0) {
                objs.splice(rmIdx, 1);
                removed = true;
            }
            return removed;
        };
        
        /**
         * Return true if model has no modifications from pristine state.
         */
        Resource.prototype.isEmpty = function() {
            var empty = true,
            res = this;
            angular.forEach(this._properties, function(vals, prop) {
                if (empty) {
                    if (res._properties[prop].length === res._pristine[prop].length) {
                        if (res._pristine[prop].length > 0) {
                            angular.forEach(vals, function(val, i) {
                                if (res._pristine[prop][i] !== val) {
                                    empty = false;
                                }
                            });
                        }
                    } else {
                        empty = false
                    }
                }
            });
            return empty;
        };
        
        /**
         * Remove all user modifications.
         */
        Resource.prototype.reset = function() {
            var res = this;
            angular.forEach(res._properties, function(vals, prop) {
                res._properties[prop] = res._pristine[prop];
            });
        };
        
        /**
         * Export resource as an RDF/XML string.
         */
        Resource.prototype._resourceToRDF = function(refs) {
            var frag = "",
            result = "",
            relFrag = "",
            res = this,
            type = this.getType(),
            id = this.getID(),
            split = false,
            relation;
            
            if (res._template !== null) {
                relation = res._template.getRelation();
                if (relation !== null) {
                    split = true;
                }
            }
            angular.forEach(res._properties, function(vals, prop) {
                var nsProp;
                if (prop === "id" && id === null) {
                    id = vals;
                } else if (prop === "type" && type === null) {
                    type = vals.getValue();
                } else {
                    nsProp = Namespace.extractNamespace(prop);
                    if ((split && (res._template !== null && res._template.hasProperty(prop))) || !split) {
                        angular.forEach(vals, function(val) {
                            if (val.isResource()) {
                                frag += '    <' + nsProp.namespace + ':' + nsProp.term + ' rdf:resource="' + val.getValue() + '"/>\n';
                                if (typeof refs !== "undefined") {
                                    refs.push(val.getValue());
                                }
                            } else {
                                frag += '    <'+ nsProp.namespace + ':' + nsProp.term;
                                if (val.hasDatatype()) {
                                    frag += ' rdf:datatype="' + val.getDatatype() + '"';
                                }
                                frag += '>' + val.getValue() + '</' + nsProp.namespace  + ':' + nsProp.term + '>\n';
                            }
                        });
                    } else {
                        angular.forEach(vals, function(val) {
                            if (val.isResource()) {
                                relFrag += '    <' + nsProp.namespace + ':' + nsProp.term + ' rdf:resource="' + val.getValue() + '"/>\n';
                                if (typeof refs !== "undefined") {
                                    refs.push(val.getValue());
                                }
                            } else {
                                relFrag += '    <'+ nsProp.namespace + ':' + nsProp.term;
                                if (val.hasDatatype()) {
                                    relFrag += ' rdf:datatype="' + val.getDatatype() + '"';
                                }
                                relFrag += '>' + val.getValue() + '</' + nsProp.namespace  + ':' + nsProp.term + '>\n';
                            }
                        });
                    }
                }
            });
            if (split) {
                nsProp = Namespace.extractNamespace('http://bibframe.org/vocab/instanceOf'); // @@@ faking it
                frag += '    <' + nsProp.namespace + ':' + nsProp.term + ' rdf:resource="' + id + '-work" />\n';
                result += '  <rdf:Description rdf:about="' + id + '-work">\n    <rdf:type rdf:resource="' + relation + '"/>\n' + relFrag + '  </rdf:Description>\n';
            }
            result += '  <rdf:Description rdf:about="' + id + '">\n    <rdf:type rdf:resource="' + type + '"/>\n' + frag + '  </rdf:Description>\n';
            return result;
        };
            
        Resource.prototype.toRDF = function(created, prefixed) {
            var rdf, head, tail, refs;
            rdf = '';
            tail = '</rdf:RDF>\n';
            refs = [];
            rdf += this._resourceToRDF(refs);
            angular.forEach(created, function(res) {
                if (refs.indexOf(res.getID()) >= 0) {
                    rdf += res.toRDF([], false);
                }
            });
            if (typeof prefixed === "undefined" || prefixed === null || prefixed) {
                head = '<?xml version="1.0"?>\n\n' + Namespace.buildRDF() + '\n';
                rdf = head + rdf + tail;
            }
            return rdf;
        };
        
        Resource.prototype._resourceToN3 = function(refs) {
            var frag = "",
            res = this;
            angular.forEach(this._properties, function(vals, prop) {
                if (prop === "id" && typeof res.getID() === "undefined") {
                    res._id = vals;
                } else if (prop === "type" && typeof res.getType() === "undefined") {
                    res._type = vals.getValue();
                } else {
                    angular.forEach(vals, function(val) {
                        if (val.isResource()) {
                            frag += '  <' + prop + '> <' + val.getValue() + '>;\n';
                            if (typeof refs !== "undefined") {
                                refs.push(val.getValue());
                            }
                        } else {
                            frag += '  <' + prop + '> \"' + val.getValue() + '\"';
                            if (val.hasDatatype()) {
                                frag += '^^<' + val.getDatatype() + '>';
                            }
                            frag += ';';
                        }
                    });
                }
            });
            return '<' + this.getID() + '>\n' + frag + ' rdf:type <' + this.getType() + '> .\n';
        };

        Resource.prototype.toN3 = function(created, prefixed) {
            var rdf, refs, res;
            rdf = (typeof prefixed === "undefined" || prefixed === null || prefixed) ? '@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n\n' : "";
            refs = [];
            rdf += this._resourceToN3(refs);
            angular.forEach(created, function(res) {
                if (refs.indexOf(res.getID()) >= 0) {
                    rdf += res.toN3([], false);
                }
            });
            
            return rdf;
        };

        return Resource;
    }
})();
