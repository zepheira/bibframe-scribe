"use strict";

describe("Profiles", function() {
    var Profiles, mockProfileResource, $httpBackend;

    beforeEach(module("bibframeEditor"));
    beforeEach(inject(function($injector) {
        $httpBackend = $injector.get("$httpBackend");
        mockProfileResource = $injector.get("Profiles");
    }));

    describe("get", function() {
        it("should call get", inject(function(Profiles) {
            $httpBackend.expectGET("./profiles/test.json").respond({
                "Profile": {
                    "id": "test"
                }
            });

            var result = mockProfileResource.get({
                profile: "test",
                format: "json"
            });

            $httpBackend.flush();
                        
            expect(result.Profile.id).toEqual("test");
        }));
    });
});
