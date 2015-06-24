"use strict";

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
