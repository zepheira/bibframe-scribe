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

describe("Configuration", function() {
    var Configuration, mockConfigurationResource, $httpBackend;

    beforeEach(module("bibframeEditor"));
    beforeEach(inject(function($injector) {
        $httpBackend = $injector.get("$httpBackend");
        mockConfigurationResource = $injector.get("Configuration");
    }));

    describe("get", function() {
        it("should call get", inject(function(Profiles) {
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

describe("Store", function() {
    var Store, mockStoreResource, $httpBackend;

    beforeEach(module("bibframeEditor"));
    beforeEach(inject(function($injector) {
        $httpBackend = $injector.get("$httpBackend");
        mockStoreResource = $injector.get("Store");
    }));

    describe("id", function() {
        it("should call id", inject(function(Store) {
            $httpBackend.expectPOST("../resource/id").respond({
                "id": "testuuid"
            });

            var result = mockStoreResource.id();
            $httpBackend.flush();
                        
            expect(result.id).toEqual("testuuid");
        }));
    });

    describe("new", function() {
        it("should call new", inject(function(Store) {
            $httpBackend.expectPUT("../resource/new").respond({
                "success": true
            });

            var result = mockStoreResource.new();
            $httpBackend.flush();

            expect(result.success).toEqual(true);
        }));
    });
});

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
