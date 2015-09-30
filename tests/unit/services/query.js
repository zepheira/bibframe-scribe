"use strict";

describe("Query", function() {
    var Query, mockQueryResource, $httpBackend;

    beforeEach(module("bibframeEditor"));
    beforeEach(inject(function($injector) {
        $httpBackend = $injector.get("$httpBackend");
        mockQueryResource = $injector.get("Query");
    }));

    describe("suggest", function() {
        it("should call suggest", inject(function(Query) {
            $httpBackend.expectGET("../suggest/master?q=test&services=%5Blocal:subject%5D").respond([{
                "uri": "urn:test",
                "label": "Test",
                "fullLabel": "Test",
                "source": "local"
            }]);

            var result = mockQueryResource.suggest({"q": "test", "services": "[local:subject]"});
            $httpBackend.flush();
                        
            expect(result[0].uri).toEqual("urn:test");
        }));
    });
});
