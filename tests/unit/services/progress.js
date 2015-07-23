"use strict";

describe("Progress", function() {
    var Progress, scope;

    beforeEach(module("bibframeEditor"));
    beforeEach(inject(function($rootScope, $injector) {
        scope = $rootScope.$new();
        Progress = $injector.get("Progress");
        Progress.setTotal(10);
    }));

    it("should start at 0", inject(function() {
        expect(Progress.getCurrent()).toEqual(0);
    }));

    it("should increment once and reach 10", inject(function() {
        Progress.increment();
        scope.$digest();
        expect(Progress.getCurrent()).toEqual(10);
    }));

    it("should increment five times and reach 50", inject(function() {
        var i;
        for (i = 0; i < 5; i++) {
            Progress.increment();
            scope.$digest();
        }
        expect(Progress.getCurrent()).toEqual(50);
    }));

    it("should increment five times and reach 50", inject(function() {
        var i;
        for (i = 0; i < 10; i++) {
            Progress.increment();
            scope.$digest();
        }
        expect(Progress.getCurrent()).toEqual(100);
    }));
});
