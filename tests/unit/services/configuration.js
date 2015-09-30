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
            services: {
                "foo": "bar"
            },
            dataTypes: {},
            idBase: ""
        });
        $httpBackend.whenGET("./profiles/test.json").respond({
            Profile: {
                resourceTemplate: [
                    {
                        id: "rt-test",
                        "class": {
                            id: "rt-class-test"
                        }
                    }
                ]
            }
        });
        $httpBackend.whenGET("./schema/schema.n3").respond("<rt-class-test> rdfs:subClassOf <urn:superclass> .");
        $httpBackend.whenPOST("../resource/id").respond(["0","1","2","3","4"]);
    }));

    it("should parse configuration", function() {
        Configuration.initialize();
        $httpBackend.flush();
        expect(Configuration.getConfig()).not.toBeNull();
        expect(Configuration.getFirstClass()).toEqual(["urn:superclass"]);
        expect(Configuration.getSearchServices()).toEqual({foo: "bar"});
        //@@@ should be 1?
        //expect(Configuration.getResourceOptions().length).toEqual(0);
        expect(Configuration.isInitialized()).toEqual(true);
    });

});
