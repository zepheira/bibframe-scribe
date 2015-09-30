"use strict";

describe("Export controller", function() {
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
        ctrl = $controller("ExportController", {
            $scope: $scope,
            $modalInstance: modalInstance,
            rdf: "<rdf:RDF></rdf:RDF>"
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
