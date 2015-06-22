"use strict";

describe("Property", function() {
    describe("constructor", function() {
        var prop;
        beforeEach(function() {
            prop = new Property({"id": "test", "propertyLabel": "Test"});
        });
    
        it("should have the right ID", function() {
            expect(prop.getID()).toEqual("test");
        });
        
        it("should have the right label", function() {
            expect(prop.getLabel()).toEqual("Test");
        });
    });

    describe("empty constructor", function() {
        var prop;
        beforeEach(function() {
            prop = new Property({});
        });
    
        it("should have a null ID", function() {
            expect(prop.getID()).toEqual(null);
        });
        
        it("should have a null label", function() {
            expect(prop.getLabel()).toEqual(null);
        });
    });    
});
