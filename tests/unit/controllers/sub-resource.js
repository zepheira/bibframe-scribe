"use strict";

describe("Sub Resource (pivoting) controller", function() {
    beforeEach(module("bibframeEditor"));

    var $scope, $controller, ctrl, modalInstance, Resource, ResourceTemplate;

    beforeEach(inject(function($rootScope, _$controller_, $injector) {
        $scope = $rootScope.$new();
        $controller = _$controller_;
        Resource = $injector.get("Resource");
        ResourceTemplate = $injector.get("ResourceTemplate");
        modalInstance = {
            close: jasmine.createSpy("modalInstance.close"),
            dismiss: jasmine.createSpy("modalInstance.dismiss"),
            result: {
                then: jasmine.createSpy("modalInstance.result.then")
            }
        };
        ctrl = $controller("SubResourceController", {
            $scope: $scope,
            $modalInstance: modalInstance,
            template: new ResourceTemplate({
                id: "test",
                "class": {
                    id: "urn:testclass",
                    classLabel: "Test Class",
                    labelProperty: "urn:labelprop",
                    propertyTemplate: [{
                        property: {
                            id: "urn:testprop"
                        }
                    }],
                    instantiates: "testAlt",
                }
            }, {
                relations: {
                    instantiates: "include"
                }
            }),
            doInitialization: false
        });
    }));

    it("should exist", function() {
        expect(ctrl).toBeDefined();
    });

    it("should close the modal", function() {
        $scope.cancel();
        expect(modalInstance.dismiss).toHaveBeenCalled();
    });
});
