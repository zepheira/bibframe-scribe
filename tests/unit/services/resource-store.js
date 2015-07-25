"use strict";

describe("ResourceStore", function() {
    var ResourceStore

    beforeEach(module("bibframeEditor"));
    beforeEach(inject(function($injector) {
        ResourceStore = $injector.get("ResourceStore");
        ResourceStore.setIDBase("urn:id/");
    }));

    it("should get the current, unset resource", function() {
        expect(ResourceStore.getCurrent()).toBeNull();
    });

    it("should set an empty current resource", function() {
        ResourceStore.newResource();
        expect(ResourceStore.getCurrent()).not.toBeNull();
    });

    it("should set an empty current resource and its template", function() {
        ResourceStore.newResource();
        expect(ResourceStore.getCurrent().getTemplate()).toBeUndefined();
        ResourceStore.setResourceTemplate({
            getClassID: function() {
                return "test";
            }
        });
        expect(ResourceStore.getCurrent().getTemplate()).not.toBeNull();
    });

    it("should return empty created list", function() {
        expect(ResourceStore.getCreated().length).toEqual(0);
    });

    it("should add to created list", function() {
        ResourceStore.addCreated({});
        expect(ResourceStore.getCreated().length).toEqual(1);
    });

    it("should have no required properties when empty", function() {
        expect(ResourceStore.hasRequired()).toEqual(false);
    });

    it("should set and have a required property", function() {
        ResourceStore.setHasRequired(true)
        expect(ResourceStore.hasRequired()).toEqual(true);
    });

    it("should have no loading properties when empty", function() {
        expect(ResourceStore.getAllLoading()).toEqual({});
        expect(ResourceStore.isLoading("urn:test")).toEqual(false);
    });

    it("should set a loading property", function() {
        expect(ResourceStore.isLoading("urn:test")).toEqual(false);
        ResourceStore.setLoading("urn:test", true);
        expect(ResourceStore.isLoading("urn:test")).toEqual(true);
        ResourceStore.setLoading("urn:test", false);
        expect(ResourceStore.isLoading("urn:test")).toEqual(false);
    });

    it("should not return an active template", function() {
        expect(ResourceStore.getActiveTemplate()).toBeNull();
    });

    it("should set and return an active template", function() {
        ResourceStore.setActiveTemplate({});
        expect(ResourceStore.getActiveTemplate()).toEqual({});
    });
});
