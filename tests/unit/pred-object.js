"use strict";

describe("PredObject", function() {
    describe("constructor literal", function() {
        var po;
        beforeEach(function() {
            po = new PredObject("Test", null, "literal", true);
            po.setDatatype("xsd:string");
        });
        
        it("should return the label", function() {
            expect(po.getLabel()).toEqual("Test");
        });
        
        it("should not have a value", function() {
            expect(po.getValue()).toEqual(null);
        });
        
        it("should not be a resource", function() {
            expect(po.isResource()).toEqual(false);
        });

        it("should be created", function() {
            expect(po.isCreated()).toEqual(true);
        });
        
        it("should have a datatype", function() {
            expect(po.hasDatatype()).toEqual(true);
        });

        it("should change the datatype", function() {
            po.setDatatype("xsd:int");
            expect(po.getDatatype()).toEqual("xsd:int");
        });
        
        it("should change the label", function() {
            po.setLabel("NewTest");
            expect(po.getLabel()).toEqual("NewTest");
        });
    });

    describe("constructor resource", function() {
        var po;
        beforeEach(function() {
            po = new PredObject("RTest", "urn:test", "resource", false);
        });
        
        it("should return the label", function() {
            expect(po.getLabel()).toEqual("RTest");
        });
        
        it("should return the value", function() {
            expect(po.getValue()).toEqual("urn:test");
        });
        
        it("should be a resource", function() {
            expect(po.isResource()).toEqual(true);
        });

        it("should not be created", function() {
            expect(po.isCreated()).toEqual(false);
        });
        
        it("should not have a datatype", function() {
            expect(po.hasDatatype()).toEqual(false);
        });

        it("should change the value", function() {
            po.setValue("urn:newtest");
            expect(po.getValue()).toEqual("urn:newtest");
        });
    });
});
