"use strict";

describe("Property", function() {
    var prop;
    beforeEach(function() {
        prop = new Property({"id": "test", "propertyLabel": "Test"});
    });
    
    it("should have the right ID", function() {
        expect(prop.getID().toEqual("test");
    });

    it("should have the right label", function() {
        expect(prop.getID().toEqual("Test");
    });
});
