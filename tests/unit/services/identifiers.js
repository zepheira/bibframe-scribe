"use strict";

describe("Identifier", function() {
    var mockIdentifierResource, $httpBackend;

    beforeEach(module("bibframeEditor"));
    beforeEach(inject(function($injector) {
        $httpBackend = $injector.get("$httpBackend");
        mockIdentifierResource = $injector.get("Identifier");
    }));

    describe("new identifiers", function() {
        it("should get ten responses from a remote call", inject(function() {
            var result;

            $httpBackend.expectPOST("../resource/id").respond([
                "urn:test:0",
                "urn:test:1",
                "urn:test:2",
                "urn:test:3",
                "urn:test:4",
                "urn:test:5",
                "urn:test:6",
                "urn:test:7",
                "urn:test:8",
                "urn:test:9"
            ]);
            result = mockIdentifierResource.newIdentifier("http://test");
            $httpBackend.flush();

            /**
             * Timing of flush comes too late to give an actual
             * result in these tests.  Skipping the first failed "result"
             * to check subsequent calls works properly.  Ditto for local call.
             */

            result = mockIdentifierResource.newIdentifier("http://test");
            expect(result).toEqual("urn:test:8");

            result = mockIdentifierResource.newIdentifier("http://test");
            expect(result).toEqual("urn:test:7");
        }));

        it("should do a local call when remote fails", inject(function() {
            var result;
            $httpBackend.whenPOST("../resource/id").respond(500, "");

            mockIdentifierResource.newIdentifier("http://test");
            $httpBackend.flush();

            result = mockIdentifierResource.newIdentifier("http://test");
            expect(result).toMatch(/^http:\/\/test/);
        }));
    });
});
