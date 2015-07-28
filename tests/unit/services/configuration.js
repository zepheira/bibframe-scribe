"use strict";

describe("Configuration", function() {
    var Configuration, $httpBackend;

    beforeEach(module("bibframeEditor"));
    beforeEach(inject(function($injector) {
        Configuration = $injector.get("Configuration");
        $httpBackend = $injector.get("$httpBackend");
        $httpBackend.whenGET("./config.json").respond({
            profiles: [
                "test"
            ],
            firstClass: [
                "urn:superclass"
            ],
            schemas: [
                "schema.n3"
            ],
            resourceMap: {},
            resourceDefinitions: {},
            services: {},
            dataTypes: {},
            idBase: ""
        });
        $httpBackend.whenGET("./profiles/test.json").respond({
            resourceTemplate: [
                {
                    id: "rt-test",
                    "class": {
                        id: "rt-class-test"
                    }
                }
            ]
        });
        $httpBackend.whenGET("./schema/schema.n3").respond("");
    }));
    /**
    it("should parse configuration", function() {
        // this might be basically un-testable - flush needs to be called
        // before Configuration.initialize is completed, and possibly scope
        // $digest, but there really isn't a way I know of how to get the
        // required fakery timed correctly.
        Configuration.initialize();
        $httpBackend.flush();
    });
    */
});
