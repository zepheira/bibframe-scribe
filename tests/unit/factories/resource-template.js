"use strict";

describe("ResourceTemplate", function() {
    var ResourceTemplate, PropertyTemplate;
    beforeEach(module("bibframeEditor"));
    beforeEach(inject(function($injector) {
        ResourceTemplate = $injector.get("ResourceTemplate");
        PropertyTemplate = $injector.get("PropertyTemplate");
    }));

    describe("constructor", function() {
        var rt;
        beforeEach(function() {
            rt = new ResourceTemplate({
                id: "test",
                "class": {
                    type: "urn:testclass",
                    classLabel: "Test Class",
                    labelProperty: "urn:labelprop",
                    propertyTemplate: [{
                        property: {
                            id: "urn:testprop"
                        }
                    }],
                    instantiates: "testAlt"
                },
            }, {
                relations: {
                    "instantiates": "include"
                }
            });
        });
        
        it("should return the ID", function() {
            expect(rt.getID()).toEqual("test");
        });
        
        it("should return the class ID", function() {
            expect(rt.getClassID()).toEqual("urn:testclass");
        });
        
        it("should return the class label", function() {
            expect(rt.getLabel()).toEqual("Test Class");
        });
        
        it("should return the class label property", function() {
            expect(rt.getLabelProperty()).toEqual("urn:labelprop");
        });

        it("should return super class", function() {
            expect(rt.getFirstClass(["urn:testclass"], null)).toEqual("urn:testclass");
        });

        it("should return provided super class", function() {
            expect(rt.getFirstClass(["urn:fclass"], "urn:fclass")).toEqual("urn:fclass");
        });

        it("should return null super class", function() {
            expect(rt.getFirstClass(["urn:fclass"], null)).toBeNull();
        });
        
        it("should return all associated property templates", function() {
            var pt = new PropertyTemplate({property: {id: "urn:testprop"}}, rt.getID());
            expect(rt.getPropertyTemplates()).toEqual([pt]);
        });
        
        it("should have an associated property", function() {
            expect(rt.hasProperty("urn:testprop")).toEqual(true);
        });

        it("should not have an unassociated property", function() {
            expect(rt.hasProperty("urn:prop")).toEqual(false);
        });
        
        it("should return the relation type", function() {
            expect(rt.getRelation()).toEqual("testAlt");
        });
    });

    describe("empty class constructor and empty config", function() {
        var rt;
        beforeEach(function() {
            rt = new ResourceTemplate({
                "class": {},
            }, {});
        });
        
        it("should return null ID", function() {
            expect(rt.getID()).toBeNull();
        });
        
        it("should return null class ID", function() {
            expect(rt.getClassID()).toBeNull();
        });
        
        it("should return null class label", function() {
            expect(rt.getLabel()).toBeNull();
        });
        
        it("should return null class label property", function() {
            expect(rt.getLabelProperty()).toBeNull();
        });

        it("should return the relation type", function() {
            expect(rt.getRelation()).toBeNull();
        });
    });

    describe("empty class constructor and unrelated config", function() {
        var rt;
        beforeEach(function() {
            rt = new ResourceTemplate({
                "class": {},
            }, {
                relations: {
                    "instantiates": "include"
                }
            });
        });
        
        it("should return the relation type", function() {
            expect(rt.getRelation()).toBeNull();
        });
    });

    describe("empty constructor", function() {
        var rt;
        beforeEach(function() {
            rt = new ResourceTemplate({}, {});
        });
        
        it("should return null ID", function() {
            expect(rt.getID()).toBeNull();
        });
    });
});
