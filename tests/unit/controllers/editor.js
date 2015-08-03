"use strict";

describe("BIBFRAME Editor controller", function() {
    beforeEach(module("bibframeEditor"));

    var $scope, $controller;

    beforeEach(inject(function($rootScope, _$controller_) {
        $scope = $rootScope.$new();
        $controller = _$controller_;
    }));

    it("should exist", function() {
        var editorCtrl = $controller("EditorController", {$scope: $scope});
        expect(editorCtrl).toBeDefined();
    });
});
