/**
 * Because "object" would not be a good choice of name.
 */
(function() {
    angular
        .module("predObjectFactory", [])
        .factory("PredObject", PredObjectFactory);

    function PredObjectFactory() {

        function PredObject(label, value, type, created) {
            this._label = label;
            this._value = value;
            this._type = type;
            this._created = created;
            this._datatype = null;
        }

        PredObject.prototype.getLabel = function() {
            return this._label;
        };
        
        PredObject.prototype.getValue = function() {
            return this._value;
        };
        
        PredObject.prototype.isResource = function() {
            return (this._type === "resource");
        };
        
        PredObject.prototype.isCreated = function() {
            return this._created;
        };
        
        PredObject.prototype.hasDatatype = function() {
            return (!this.isResource() && this.getDatatype() !== null);
        };
        
        PredObject.prototype.getDatatype = function() {
            return this._datatype;
        };
        
        PredObject.prototype.setDatatype = function(dt) {
            this._datatype = dt;
        };
        
        PredObject.prototype.setLabel = function(label) {
            this._label = label;
        };
        
        PredObject.prototype.setValue = function(value) {
            this._value = value;
        };
        
        return PredObject;
    }
})();
