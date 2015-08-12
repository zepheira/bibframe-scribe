(function() {
    angular
        .module("resourceFactory", [])
        .factory("Resource", ["PredObject", "Namespace", "Identifier", ResourceFactory]);

    function ResourceFactory(PredObject, Namespace, Identifier) {
        function Resource(idBase, tmpl) {
            this._id = (idBase !== null) ? Identifier.newIdentifier(idBase) : null;
            this._idBase = idBase;
            this._template = tmpl;
            this._type = (typeof tmpl !== "undefined" && tmpl !== null) ? tmpl.getClassID() : null;
            this._properties = {};
            this._pristine = {};
            this._relation = (typeof tmpl !== "undefined" && tmpl !== null && tmpl.hasRelation() && tmpl.getRelationResourceTemplate() !== null) ? new Resource(idBase, tmpl.getRelationResourceTemplate()) : null;
            this._loading = {};
            this._hasRequired = false;
        }

        /**
         * Return resource URI.
         */
        Resource.prototype.getID = function() {
            return this._id;
        };

        /**
         * Set the ID.
         */
        Resource.prototype.setID = function(id) {
            this._id = id;
        }

        /**
         * Return resource URI.
         */
        Resource.prototype.getType = function() {
            return this._type;
        };

        /**
         * Set type.
         */
        Resource.prototype.setType = function(type) {
            this._type = type;
        }
        
        Resource.prototype.setTemplate = function(tmpl) {
            this._template = tmpl;
            if (typeof tmpl !== "undefined") {
                this._type = tmpl.getClassID();
                if (tmpl.hasRelation()) {
                    this._relation = new Resource(this._idBase, tmpl.getRelationResourceTemplate());
                }
            }
        };

        Resource.prototype.getTemplate = function() {
            return this._template;
        };

        /**
         */
        Resource.prototype.setLoading = function(prop, loading) {
            if (typeof this._loading[prop] !== "undefined") {
                this._loading[prop] = loading;
            } else if (this._relation !== null) {
                this._relation.setLoading(prop, loading);
            }
        };

        Resource.prototype.isLoading = function(prop) {
            var loading = false;
            if (typeof this._loading[prop] !== "undefined") {
                loading = this._loading[prop];
            } else if (this._relation !== null) {
                loading = this._relation.isLoading(prop);
            }
            return loading;
        };

        Resource.prototype.hasRequired = function() {
            var req = this._hasRequired;
            if (this._relation !== null) {
                req = req || this._relation.hasRequired();
            }
            return req;
        };

        Resource.prototype.initialize = function() {
            var props, res;
            res = this;
            if (res._template !== null) {
                props = res._template.getOwnPropertyTemplates();
                angular.forEach(props, function(property) {
                    var constraint, defaultVal;
                    prop = property.getProperty().getID();
                    if (typeof res._properties[prop] === "undefined") {
                        res._properties[prop] = [];
                        res._pristine[prop] = [];
                        res._loading[prop] = false;
                    }
                    if (property.hasConstraint()) {
                        constraint = property.getConstraint();
                        if (constraint.hasDefaultURI()) {
                            if (constraint.hasDefaultLiteral()) {
                                defaultVal = new PredObject(constraint.getDefaultLiteral(), constraint.getDefaultURI(), property.getType(), false);
                            } else {
                                defaultVal = new PredObject(constraint.getDefaultURI(), constraint.getDefaultURI(), property.getType(), false);
                            }
                            res._properties[prop].push(defaultVal);
                            res._pristine[prop].push(defaultVal);
                        } else if (property.getConstraint().hasDefaultLiteral()) {
                            defaultVal = new PredObject(constraint.getDefaultLiteral(), null, property.getType(), false);
                            res._properties[prop].push(defaultVal);
                            res._pristine[prop].push(defaultVal);
                        }
                    }
                    if (!res._hasRequired && property.isRequired()) {
                        res._hasRequired = true;
                    }
                });
                if (res._relation !== null) {
                    res._relation.initialize();
                    if (res._relation.hasRequired()) {
                        res._hasRequired = true;
                    }
                }
            }
        };
        
        /**
         * Return property values based on the property URI.
         */
        Resource.prototype.getPropertyValues = function(property) {
            var vals = null;
            if (typeof this._properties[property] !== "undefined") {
                vals = this._properties[property];
            } else if (this._relation !== null) {
                vals = this._relation.getPropertyValues(property);
            }
            return vals;
        }

        /**
         * Set a work's value of a property when only the name of the
         * property and its object type are known. Will not set any
         * further constraints on text values.  This is largely to
         * facilitate internal additions.
         */
        Resource.prototype.addTextPropertyValue = function(property, type, value) {
            var seen, val, isDirty, textValue;
            val = null;
            isDirty = false;
            seen = false;
            if (typeof value === "object" && typeof value.toISOString !== "undefined") {
                textValue = value.toISOString().split("T")[0];
            } else if (typeof value ==="object") {
                val = value;
                textValue = value.getValue();
            } else {
                textValue = value;
            }
            if (this._template.hasProperty(property)) {
                if (typeof this._properties[property] === "undefined") {
                    this._properties[property] = [];
                } else {
                    angular.forEach(this._properties[property], function(v) {
                        if (v.getValue() === textValue) {
                            seen = true;
                        }
                    });
                }
                if (!seen && textValue !== "") {
                    isDirty = true;
                    if (val === null) {
                        val = new PredObject(textValue, textValue, type, true);
                    }
                    this._properties[property].push(val);
                }
            } else if (this._relation !== null) {
                isDirty = this._relation.addTextPropertyValue(property, type, value);
            } else {
                // @@@ error
            }
            return isDirty;
        };
        
        /**
         * Set work's value of property to String or Date value.
         * Returns true if it makes a change in the model, false if not.
         */
        Resource.prototype.addPropertyValue = function(property, value) {
            var propID, objType, seen, val, isDirty, textValue;
            val = null;
            isDirty = false;
            propID = property.getProperty().getID();
            objType = property.getType();
            seen = false;
            if (typeof value === "object" && typeof value.toISOString !== "undefined") {
                textValue = value.toISOString().split("T")[0];
            } else if (typeof value ==="object") {
                val = value;
                textValue = value.getValue();
            } else {
                textValue = value;
            }
            if (this._template.hasProperty(propID)) {
                if (typeof this._properties[propID] === "undefined") {
                    this._properties[propID] = [];
                } else {
                    angular.forEach(this._properties[propID], function(v) {
                        if (v.getValue() === textValue) {
                            seen = true;
                        }
                    });
                }
                if (!seen && textValue !== "") {
                    isDirty = true;
                    if (val === null) {
                        val = new PredObject(textValue, textValue, objType, true);
                    }
                    if (property.hasConstraint() && property.getConstraint().hasComplexType()) {
                        val.setDatatype(property.getConstraint().getComplexTypeID());
                    };
                    this._properties[propID].push(val);
                }
            }  else if (this._relation !== null) {
                isDirty = this._relation.addPropertyValue(property, value);
            } else {
                // @@@ error
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
            if (typeof this._properties[prop] !== "undefined") {
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
            } else if (this._relation !== null) {
                removed = this._relation.removePropertyValue(property, value);
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
                        empty = false;
                    }
                }
            });
            if (this._relation !== null) {
                empty = empty && this._relation.isEmpty();
            }
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
            angular.forEach(res._loading, function(vals, prop) {
                res._loading[prop] = false;
            });
            if (this._relation !== null) {
                this._relation.reset();
            }
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
            id = this.getID();

            angular.forEach(res._properties, function(vals, prop) {
                var nsProp;
                nsProp = Namespace.extractNamespace(prop);
                if (res._template !== null && res._template.hasProperty(prop)) {
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
            });
            if (this._relation !== null) {
                nsProp = Namespace.extractNamespace('http://bibfra.me/vocab/lite/' + this._template.getRelationType());
                frag += '    <' + nsProp.namespace + ':' + nsProp.term + ' rdf:resource="' + this._relation.getID() + '" />\n';
                result += this._relation.toRDF([], false);
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
            result = "",
            res = this;
            angular.forEach(res._properties, function(vals, prop) {
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
            });
            if (res._relation !== null) {
                result += res._relation.toN3([], false);
            }
            result += '<' + res.getID() + '>\n' + frag + ' rdf:type <' + res.getType() + '> .\n';
            return result;
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
