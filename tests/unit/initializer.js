"use strict";

describe("BIBFRAME Editor application", function() {
    beforeEach(module("bibframeEditor"));

    var $scope, $controller;

    beforeEach(inject(function($rootScope, _$controller_) {
        $scope = $rootScope.$new();
        $controller = _$controller_;
    }));

    describe("editor contoller", function() {
        it("should exist", function() {
            var editorCtrl = $controller("EditorController", {$scope: $scope});
            expect(editorCtrl).toBeDefined();
        });
    });

    describe("export contoller", function() {
        var ctrl, modalInstance;
        beforeEach(inject(
            function($controller) {
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
            }
        ));
        it("should exist", function() {
            expect(ctrl).toBeDefined();
        });
        it("should close the modal", function() {
            $scope.close();
            expect(modalInstance.dismiss).toHaveBeenCalled();
        });
    });

    describe("show resource contoller", function() {
        var ctrl, modalInstance;
        beforeEach(inject(
            function($controller) {
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
            }
        ));
        it("should exist", function() {
            expect(ctrl).toBeDefined();
        });
        it("should close the modal", function() {
            $scope.close();
            expect(modalInstance.dismiss).toHaveBeenCalled();
        });
    });

    describe("sub-resource contoller", function() {
        var ctrl, modalInstance, Resource, ResourceTemplate;
        beforeEach(inject(
            function($controller, $injector) {
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
                    current: new Resource("test"),
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
                    controller: {
                        getReferenceResourceType: null,
                        editLiteral: null,
                        editResource: null,
                        showResource: null,
                        isLoading: null,
                        reset: null,
                        autocomplete: null,
                        pivot: null,
                        dataTypes: null,
                        setValueFromInput: null
                    }
                });
            }
        ));
        it("should exist", function() {
            expect(ctrl).toBeDefined();
        });
        it("should close the modal", function() {
            $scope.cancel();
            expect(modalInstance.dismiss).toHaveBeenCalled();
        });
    });

    describe("ngEnter attribute directive", function() {
        var elm;
        beforeEach(inject(function($compile) {
            $scope.a = 0;
            $scope.setIt = function() {
                ++$scope.a;
            }
            elm = angular.element("<span ng-enter='setIt()'>test{{a}}</span>");
            $compile(elm)($scope);
        }));

        it("should evaluate on Enter key down", function() {
            var e;
            expect(elm.text()).toEqual("test{{a}}");
            $scope.$digest();
            expect($scope.a).toEqual(0);
            expect(elm.text()).toEqual("test0");
            // Keyboard stuff is so jacked up across browsers that this
            // test will fail in Chrome and Safari, and PhantomJS while
            // running fine in Firefox and IE; the implementation should
            // be sufficient to work cross-browser, but it's not worth the
            // trouble to make the test work cross-browser.
            try {
                e = new KeyboardEvent("keypress", {code: "Enter", key: "Enter", location: 0, which: 13});
            } catch (err) {
                e = null;
            }
            if (e !== null && typeof e.code !== "undefined") {
                elm[0].dispatchEvent(e);
                $scope.$digest();
                expect($scope.a).toEqual(1);
                expect(elm.text()).toEqual("test1");
            }
        });

        it("should evaluate on Enter key press", function() {
            var e;
            expect(elm.text()).toEqual("test{{a}}");
            $scope.$digest();
            expect($scope.a).toEqual(0);
            expect(elm.text()).toEqual("test0");
            // Keyboard stuff is so jacked up across browsers that this
            // test will fail in Chrome and Safari, and PhantomJS while
            // running fine in Firefox and IE; the implementation should
            // be sufficient to work cross-browser, but it's not worth the
            // trouble to make the test work cross-browser.
            try {
                e = new KeyboardEvent("keypress", {code: "Enter", key: "Enter", location: 0, which: 13});
            } catch (err) {
                e = null;
            }
            if (e !== null && typeof e.code !== "undefined") {
                elm[0].dispatchEvent(e);
                $scope.$digest();
                expect($scope.a).toEqual(1);
                expect(elm.text()).toEqual("test1");
            }
        });
    });
});
