"use strict";

describe("Configuration", function() {
    var Configuration, mockConfigurationResource, $httpBackend;

    beforeEach(module("bibframeEditor"));
    beforeEach(inject(function($injector) {
        $httpBackend = $injector.get("$httpBackend");
        mockConfigurationResource = $injector.get("Configuration");
    }));

    describe("get", function() {
        it("should call get", inject(function(Configuration) {
            $httpBackend.expectGET("./config.json").respond({
                "profiles": [
                    "test"
                ],
                "schemas": [
                    "augment.n3"
                ],
                "firstClass": [
                    "http://bibframe.org/vocab/Work"
                ],
                "relations": {
                    "instanceOf": "include"
                },
                "resourceServiceMap": {
                    "http://bibframe.org/vocab/Book": "Works"
                },
                "serviceProviderMap": {
                    "Subjects": [
                        "local:subjects"
                    ]
                },
                "providerList": {
                    "local": {
                        "short": "Local",
                        "full": "Local Database"
                    }
                },
                "dataTypes": [
                    {
                        "id": "http://bibframe.org/vocab/proposed/ISO8601",
                        "handler": "date"
                    }
                ]
            });

            var result = mockConfigurationResource.get();
            $httpBackend.flush();
                        
            expect(result.profiles.length).toEqual(1);
        }));
    });
});
