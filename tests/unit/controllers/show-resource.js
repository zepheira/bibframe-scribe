"use strict";

describe("Show Resource controller", function() {
    beforeEach(module("bibframeEditor"));

    var $scope, $controller, ctrl, modalInstance;

    beforeEach(inject(function($rootScope, _$controller_) {
        $scope = $rootScope.$new();
        $controller = _$controller_;
        modalInstance = {
            close: jasmine.createSpy("modalInstance.close"),
            dismiss: jasmine.createSpy("modalInstance.dismiss"),
            result: {
                then: jasmine.createSpy("modalInstance.result.then")
            }
        };
        ctrl = $controller("ShowResourceController", {
            $scope: $scope,
            $modalInstance: modalInstance,
            rdf: "<rdf:RDF></rdf:RDF>",
            label: "Test",
            uri: "urn:test"
        });
    }));

    it("should exist", function() {
        expect(ctrl).toBeDefined();
    });

    it("should close the modal", function() {
        $scope.close();
        expect(modalInstance.dismiss).toHaveBeenCalled();
    });
});
