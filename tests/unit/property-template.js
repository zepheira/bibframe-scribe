"use strict";

describe("PropertyTemplate", function() {
    describe("constructor", function() {
        var pt;
        beforeEach(function() {
            pt = new PropertyTemplate({
                repeatable: "true",
                mandatory: "true",
                type: "resource",
                property: {
                    id: "urn:test",
                    propertyLabel: "Test"
                },
                valueConstraint: {
                    descriptionTemplateRef: "testref"
                }
            });
        });
        
        it("should not be optional", function() {
            expect(pt.isOptional()).toEqual(false);
        });
        
        it("should be mandatory", function() {
            expect(pt.isRequired()).toEqual(true);
        });
        
        it("should be repeatable", function() {
            expect(pt.isRepeatable()).toEqual(true);
        });

        it("should not be a literal property", function() {
            expect(pt.isLiteral()).toEqual(false);
        });

        it("should be a resource property", function() {
            expect(pt.isResource()).toEqual(true);
        });

        it("should return resource", function() {
            expect(pt.getType()).toEqual(PropertyTemplate.RESOURCE);
        });

        it("should return the property", function() {
            expect(pt.getProperty().getID()).toEqual("urn:test");
        });

        it("should have a value constraint", function() {
            expect(pt.hasConstraint()).toEqual(true);
        });

        it("should return an empty value constraint", function() {
            var vc = new ValueConstraint({
                descriptionTemplateRef: "testref"
            });
            expect(pt.getConstraint().getReference()).toEqual(vc.getReference());
        });
    });
});
