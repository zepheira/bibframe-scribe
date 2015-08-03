"use strict";

describe("PropertyTemplate", function() {
    var PropertyTemplate, ValueConstraint;
    beforeEach(module("bibframeEditor"));
    beforeEach(inject(function($injector) {
        PropertyTemplate = $injector.get("PropertyTemplate");
        ValueConstraint = $injector.get("ValueConstraint");
    }));

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

    describe("empty constructor", function() {
        var pt;
        beforeEach(function() {
            pt = new PropertyTemplate({});
        });
        
        it("should be optional", function() {
            expect(pt.isOptional()).toEqual(true);
        });
        
        it("should not be mandatory", function() {
            expect(pt.isRequired()).toEqual(false);
        });
        
        it("should not be repeatable", function() {
            expect(pt.isRepeatable()).toEqual(false);
        });

        it("should be a literal property", function() {
            expect(pt.isLiteral()).toEqual(true);
        });

        it("should not be a resource property", function() {
            expect(pt.isResource()).toEqual(false);
        });

        it("should return literal type", function() {
            expect(pt.getType()).toEqual(PropertyTemplate.LITERAL);
        });

        it("should return null property", function() {
            expect(pt.getProperty()).toEqual(null);
        });

        it("should not have a value constraint", function() {
            expect(pt.hasConstraint()).toEqual(false);
        });

        it("should return null value constraint", function() {
            expect(pt.getConstraint()).toEqual(null);
        });
    });
});
