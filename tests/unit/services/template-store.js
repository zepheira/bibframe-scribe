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
});
