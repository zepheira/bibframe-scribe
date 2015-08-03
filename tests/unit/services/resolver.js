"use strict";

describe("Resolver", function() {
    var Resolver, mockResolverResource, $httpBackend;

    beforeEach(module("bibframeEditor"));
    beforeEach(inject(function($injector) {
        $httpBackend = $injector.get("$httpBackend");
        mockResolverResource = $injector.get("Resolver");
    }));

    describe("resolve", function() {
        it("should call resolve", inject(function(Resolver) {
            $httpBackend.expectGET("../resolver?r=urn:test").respond("<rdf:RDF></rdf:RDF>");

            var result = mockResolverResource.resolve({"uri": "urn:test"});
            $httpBackend.flush();
                        
            expect(result.raw).toEqual("<rdf:RDF></rdf:RDF>");
        }));
    });
});
