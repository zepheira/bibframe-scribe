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
                "resourceMap": {
                    "Works": {
                        "classes": [
                            "http://bibframe.org/vocab/Book"
                        ],
                        "services": [
                            "local:works"
                        ]
                    }
                },
                "services": {
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
