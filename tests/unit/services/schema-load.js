"use strict";

describe("Schemas", function() {
    var mockSchemasResource, $httpBackend;

    beforeEach(module("bibframeEditor"));
    beforeEach(inject(function($injector) {
        $httpBackend = $injector.get("$httpBackend");
        mockSchemasResource = $injector.get("Schemas");
        $httpBackend.expectGET("./schema/bibframe.n3").respond("@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .");
    }));

    afterEach(function() {
        $httpBackend.flush();
    });

    describe("get", function() {
        it("should call get", function() {
            var result = mockSchemasResource.get("bibframe.n3");

            result.success(function(r) {
                expect(r).toMatch(/^@prefix rdf/);
            });
        });
    });
});
