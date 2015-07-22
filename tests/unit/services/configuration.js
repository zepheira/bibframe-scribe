"use strict";

describe("Configuration", function() {
    var Configuration;

    beforeEach(module("bibframeEditor"));
    beforeEach(inject(function($injector) {
        Configuration = $injector.get("Configuration");
    }));
});
