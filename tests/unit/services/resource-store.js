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
});
