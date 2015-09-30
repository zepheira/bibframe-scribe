"use strict";

describe("ConfigurationLoad", function() {
    var ConfigurationLoad, mockConfigurationResource, $httpBackend;

    beforeEach(module("bibframeEditor"));
    beforeEach(inject(function($injector) {
        $httpBackend = $injector.get("$httpBackend");
        mockConfigurationResource = $injector.get("ConfigurationLoad");
    }));

    describe("get", function() {
        it("should call get", inject(function(ConfigurationLoad) {
            $httpBackend.expectGET("./config.json").respond({
                "profiles": [
                    "test"
                ]
            });

            var result = mockConfigurationResource.get();
            $httpBackend.flush();
                        
            expect(result.profiles.length).toEqual(1);
        }));
    });
});
