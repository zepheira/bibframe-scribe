"use strict";

describe("ProfileLoad", function() {
    var ProfileLoad, mockProfileResource, $httpBackend;

    beforeEach(module("bibframeEditor"));
    beforeEach(inject(function($injector) {
        $httpBackend = $injector.get("$httpBackend");
        mockProfileResource = $injector.get("ProfileLoad");
    }));

    describe("get", function() {
        it("should call get", inject(function(ProfileLoad) {
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
