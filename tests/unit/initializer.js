"use strict";

describe("BIBFRAME Editor application", function() {
    beforeEach(module("bibframeEditor"));

    var $scope, $controller;

    beforeEach(inject(function($rootScope, _$controller_) {
        $scope = $rootScope.$new()
        $controller = _$controller_;
    }));

    describe("editor contoller", function() {
        it("should exist", function() {
            var editorCtrl = $controller("EditorCtrl", {$scope: $scope});
            expect(editorCtrl).toBeDefined();
        });
    });
});
