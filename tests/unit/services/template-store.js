"use strict";

describe("TemplateStore", function() {
    var TemplateStore

    beforeEach(module("bibframeEditor"));
    beforeEach(inject(function($injector) {
        TemplateStore = $injector.get("TemplateStore");
    }));

    it("should retrieve empty profiles list", function() {
        expect(TemplateStore.getProfiles().length).toEqual(0);
    });

    it("should add to profiles list", function() {
        TemplateStore.addProfile({});
        expect(TemplateStore.getProfiles().length).toEqual(1);
    });

    it("should add a resource to first class mapping", function() {
        expect(TemplateStore.getResourceFirstClass("test")).toBeUndefined();
        TemplateStore.addResourceFirstClass("test", "urn:a");
        expect(TemplateStore.getResourceFirstClass("test")).toEqual("urn:a");
    });

    it("should add a resource template", function() {
        expect(TemplateStore.hasTemplateByClassID("test")).toEqual(false);
        TemplateStore.addResourceTemplate({
            getClassID: function() {
                return "test";
            },
            testprop: "Foo"
        })
        expect(TemplateStore.hasTemplateByClassID("test")).toEqual(true);
        expect(TemplateStore.getTemplateByClassID("test").testprop).toEqual("Foo");
    });

    it("should return and modify a modifiable ID template hash", function() {
        var h = TemplateStore.getTemplateIDHash();
        expect(h["test"]).toBeUndefined();
        expect(TemplateStore.hasTemplateByID("test")).toEqual(false);
        h["test"] = {};
        expect(TemplateStore.hasTemplateByID("test")).toEqual(true);
        expect(TemplateStore.getTemplateByID("test")).toEqual({});
    });

    it("should not find a non-existent resource type", function() {
        expect(TemplateStore.getTypeProperties("test")).toBeUndefined();
    });

    it("should add and find a basic resource type", function() {
        var h = TemplateStore.getTemplateIDHash();
        h["urn:test"] = {
            getClassID: function() {
                return "urn:classtest";
            }
        };
        TemplateStore.addResourceType("urn:classtest", "foo");
        expect(TemplateStore.getReferenceResourceType("urn:classtest")).toBeNull();
        expect(TemplateStore.getReferenceResourceType("urn:test")).toEqual("foo");
    });

    it("should add and find a complex resource type", function() {
        TemplateStore.addResourceType("urn:test", {type: "test", propertyMap: {}});
        expect(TemplateStore.getTypeProperties("test")).not.toBeUndefined();
        expect(TemplateStore.getTypeProperties("test")).toEqual({});
    });
});
