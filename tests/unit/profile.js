"use strict";

describe("Profile", function() {
    describe("near-empty constructor", function() {
        var profile;
        beforeEach(function() {
            profile = new Profile("test");
        });
        
        it("should return the ID", function() {
            expect(profile.getID()).toEqual("test");
        });

        it("should return an emtpy array", function() {
            expect(profile.init({}, {}, function() {})).toEqual([]);
        });

        it("should return a null resource template", function() {
            expect(profile.getResourceTemplate("test")).toBeNull();
        });

        it("should return a null template by ID", function() {
            expect(profile.getTemplateByID("test")).toBeNull();
        });

        it("should return null class templates", function() {
            expect(profile.getClassTemplates("test")).toBeNull();
        });
    });

    describe("constructor with initialize", function() {
        var profile, res;
        beforeEach(function() {
            profile = new Profile("test");
            profile.init({
                resourceTemplate: [
                    {
                        id: "rt-test",
                        "class": {
                            id: "rt-class-test"
                        }
                    }
                ]
            }, {
            }, function(tmpl, q) {
                return null;
            });
            res = new ResourceTemplate({
                id: "res-test",
                "class": {
                    id: "fc"
                }
            }, {});
            profile._processQuery(["fc"], [res, [{o: {value: "fc"}}]]);
        });
        
        it("should return a resource template", function() {
            expect(profile.getResourceTemplate("rt-class-test").getID()).toEqual("rt-test");
        });

        it("should return a template by ID", function() {
            expect(profile.getTemplateByID("rt-test").getID()).toEqual("rt-test");
        });

        it("should return class templates", function() {
            expect(profile.getClassTemplates("fc")).toEqual([res]);
        });

        it("should register and fill out the map", function() {
            var m = {};
            profile.registerResourceTemplates(m);
            expect(m["rt-test"]).not.toBe(undefined);
            expect(m["rt-class-test"]).toBe(undefined);
        });
    });

    describe("constructor with multiple query results", function() {
        var profile, res;
        beforeEach(function() {
            profile = new Profile("test");
            profile.init({
                resourceTemplate: [
                    {
                        id: "rt-test",
                        "class": {
                            id: "rt-class-test"
                        }
                    }
                ]
            }, {
            }, function(tmpl, q) {
                return null;
            });
            res = new ResourceTemplate({
                id: "res-test",
                "class": {
                    id: "fc"
                }
            }, {});
            profile._processQuery(["fct"], [res, [{o: {value: "fct"}}, {o: {value: "fct"}}]]);
        });

        it("should return multiple class templates", function() {
            expect(profile.getClassTemplates("fct").length).toEqual(2);
        });
    });

    describe("constructor with empty query results", function() {
        var profile, res;
        beforeEach(function() {
            profile = new Profile("test");
            profile.init({
                resourceTemplate: [
                    {
                        id: "rt-test",
                        "class": {
                            id: "rt-class-test"
                        }
                    }
                ]
            }, {
            }, function(tmpl, q) {
                return null;
            });
            res = new ResourceTemplate({
                id: "res-test",
                "class": {
                    id: "fc"
                }
            }, {});
            profile._processQuery([""], [res, [{o: {value: "fct"}}]]);
        });

        it("should return null class templates", function() {
            expect(profile.getClassTemplates("fc")).toEqual(null);
        });
    });
});
