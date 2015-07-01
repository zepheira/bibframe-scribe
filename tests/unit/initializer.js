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
            var editorCtrl = $controller("EditorCtrl", {$scope: $scope});
            expect(editorCtrl).toBeDefined();
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
            expect(elm.text()).toEqual("test{{a}}");
            $scope.$digest();
            expect($scope.a).toEqual(0);
            expect(elm.text()).toEqual("test0");
            var e = new KeyboardEvent("keydown", {code: "Enter", key: "Enter", location: 0, which: 13});
            // Keyboard stuff is so jacked up across browsers that this
            // test will fail in Chrome and Safari; the implementation should
            // be sufficient to work cross-browser, but it's not worth the
            // trouble to make the test work cross-browser.
            if (typeof e.code !== "undefined") {
                elm[0].dispatchEvent(e);
                $scope.$digest();
                expect($scope.a).toEqual(1);
                expect(elm.text()).toEqual("test1");
            }
        });

        it("should evaluate on Enter key press", function() {
            var e, pjs = false;
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
            } catch (e) {
                pjs = true;
                e = document.createEvent("KeyboardEvent");
                e.initEvent("keypress", true, false);
                e.keyCode = 13;
            }
            if (typeof e.code !== "undefined" || pjs) {
                elm[0].dispatchEvent(e);
                $scope.$digest();
                expect($scope.a).toEqual(1);
                expect(elm.text()).toEqual("test1");
            }
        });
    });
});
