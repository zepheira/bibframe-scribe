"use strict";

describe("ValueConstraint", function() {
    describe("constructor with simple reference and complex type", function() {
        var vc;
        beforeEach(function() {
            vc = new ValueConstraint({
                descriptionTemplateRef: "testref",
                valueLang: "en",
                valueDataType: {
                    id: "this-test",
                    valueLabel: "Test",
                    valueLabelHint: "TEST"
                },
                editable: "true",
                defaultURI: "urn:test",
                defaultLiteral: "test"
            });
        });
        
        it("should have a reference", function() {
            expect(vc.hasReference()).toEqual(true);
        });
        
        it("should not have multiple references", function() {
            expect(vc.hasManyReferences()).toEqual(false);
        });
        
        it("should return its reference", function() {
            expect(vc.getReference()).toEqual("testref");
        });
        
        it("should have a language", function() {
            expect(vc.hasLanguage()).toEqual(true);
        });

        it("should return the language", function() {
            expect(vc.getLanguage()).toEqual("en");
        });
        
        it("should not have a basic type", function() {
            expect(vc.hasBasicType()).toEqual(false);
        });
        
        it("should have a complex type", function() {
            expect(vc.hasComplexType()).toEqual(true);
        });
        
        it("should return the complex type ID", function() {
            expect(vc.getComplexTypeID()).toEqual("this-test");
        });
        
        it("should return the complex type label", function() {
            expect(vc.getComplexTypeLabel()).toEqual("Test");
        });
        
        it("should have a type hint", function() {
            expect(vc.hasHint()).toEqual(true);
        });
        
        it("should return the type hint", function() {
            expect(vc.getComplexTypeLabelHint()).toEqual("TEST");
        });
        
        it("should be editable", function() {
            expect(vc.isEditable()).toEqual(true);
        });
        
        it("should have a default URI", function() {
            expect(vc.hasDefaultURI()).toEqual(true);
        });
        
        it("should return the default URI", function() {
            expect(vc.getDefaultURI()).toEqual("urn:test");
        });
        
        it("should have a default literal", function() {
            expect(vc.hasDefaultLiteral()).toEqual(true);
        });
        
        it("should return the default literal", function() {
            expect(vc.getDefaultLiteral()).toEqual("test");
        });
    });

    describe("constructor with complex reference and basic type", function() {
        var vc;
        beforeEach(function() {
            vc = new ValueConstraint({
                descriptionTemplateRef: ["testref", "testrefAlt"],
                valueDataType: "testType"
            });
        });
        
        it("should have multiple references", function() {
            expect(vc.hasManyReferences()).toEqual(true);
        });
        
        it("should return its reference", function() {
            expect(vc.getReference()).toEqual(["testref","testrefAlt"]);
        });
        
        it("should have a basic type", function() {
            expect(vc.hasBasicType()).toEqual(true);
        });
        
        it("should not have a complex type", function() {
            expect(vc.hasComplexType()).toEqual(false);
        });
        
        it("should return the type ID", function() {
            expect(vc.getBasicType()).toEqual("testType");
        });

        it("should be editable by default", function() {
            expect(vc.isEditable()).toEqual(true);
        });
    });
});
