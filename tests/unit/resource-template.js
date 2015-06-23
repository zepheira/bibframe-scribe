"use strict";

describe("ResourceTemplate", function() {
    describe("constructor", function() {
        var rt;
        beforeEach(function() {
            rt = new ResourceTemplate({
                id: "test",
                "class": {
                    id: "urn:testclass",
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
            var pt = new PropertyTemplate({property: {id: "urn:testprop"}});
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
        
        it("should merge in more property templates", function() {
            var pt, more, morept;
            pt = new PropertyTemplate({property: {id: "urn:testprop"}});
            more = new ResourceTemplate({
                id: "test",
                "class": {
                    id: "urn:moreclass",
                    classLabel: "More Class",
                    labelProperty: "urn:labelprop",
                    propertyTemplate: [{
                        property: {
                            id: "urn:moreprop"
                        }
                    }],
                    instantiates: "testAlt"
                },
            }, {
                relations: {
                    "instantiates": "include"
                }
            });
            morept = new PropertyTemplate({property: {id: "urn:moreprop"}});
            expect(rt.getPropertyTemplates()).toEqual([pt]);
            rt.mergeTemplate(more);
            expect(rt.getPropertyTemplates()).toEqual([morept,pt]);
        });
    });
});
