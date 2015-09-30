(function() {
    angular
        .module("propertyFactory", [])
        .factory("Property", PropertyFactory);

    function PropertyFactory() {

        function Property(obj) {
            this._id = null;
            this._label = null;
            
            if (typeof obj.id !== "undefined") {
                this._id = obj.id;
            }
            
            if (typeof obj.propertyLabel !== "undefined") {
                this._label = obj.propertyLabel;
            }
        };
        
        Property.prototype.getID = function() {
            return this._id;
        };
        
        Property.prototype.getLabel = function() {
            return this._label;
        };

        return Property;
    }
})();
