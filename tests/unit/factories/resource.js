"use strict";

describe("Resource", function() {
    var Resource, ResourceTemplate, PropertyTemplate, Property, PredObject;
    beforeEach(module("bibframeEditor"));
    beforeEach(inject(function($injector) {
        Resource = $injector.get("Resource");
        PropertyTemplate = $injector.get("PropertyTemplate");
        ResourceTemplate = $injector.get("ResourceTemplate");
        Property = $injector.get("Property");
        PredObject = $injector.get("PredObject");
    }));

    describe("constructor", function() {
        var r, rt, pt;
        beforeEach(function() {
            rt = new ResourceTemplate({
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
                    instantiates: "testAlt"
                },
            }, {
                relations: {
                    "instantiates": "include"
                }
            });
            pt = new PropertyTemplate({
                repeatable: "true",
                mandatory: "true",
                type: "resource",
                property: {
                    id: "http://example.org/newprop",
                    propertyLabel: "New Prop"
                },
                valueConstraint: {
                    descriptionTemplateRef: "testref"
                }
            });
            r = new Resource("urn:test", rt);
        });
        
        it("should return the ID", function() {
            expect(r.getID()).toEqual("urn:test");
        });
        
        it("should return the type", function() {
            expect(r.getType()).toEqual("urn:testclass");
        });

        it("should have no modifications", function() {
            expect(r.isEmpty()).toEqual(true);
        });

        it("should add a new property option, be empty", function() {
            r.initializeProperty(pt, {hasRequired: false, loading: {}});
            expect(typeof r._properties["http://example.org/newprop"]).not.toBeUndefined();
            expect(r.isEmpty()).toEqual(true);
        });

        it("should add a new property option and value and set flags", function() {
            var flags = {hasRequired: false, loading: {}};
            r.initializeProperty(pt, flags);
            r.addPropertyValue(pt, "urn:val");
            expect(typeof r._properties["http://example.org/newprop"]).not.toBeUndefined();
            expect(r._properties["http://example.org/newprop"][0].getValue()).toEqual("urn:val");
            expect(r.isEmpty()).toEqual(false);
            expect(flags.loading["http://example.org/newprop"]).toEqual(false);
            expect(flags.hasRequired).toEqual(true);
        });

        it("should add and then remove a property value", function() {
            var flags = {hasRequired: false, loading: {}};
            r.initializeProperty(pt, flags);
            r.addPropertyValue(pt, "urn:val");
            expect(r._properties["http://example.org/newprop"][0].getValue()).toEqual("urn:val");
            expect(r.isEmpty()).toEqual(false);
            expect(r.removePropertyValue("http://example.org/newprop", "urn:val")).toEqual(true);
            expect(r.isEmpty()).toEqual(true);
        });

        it("should reset to an empty state", function() {
            var flags = {hasRequired: false, loading: {}};
            r.initializeProperty(pt, flags);
            r.addPropertyValue(pt, "urn:val");
            expect(r._properties["http://example.org/newprop"][0].getValue()).toEqual("urn:val");
            expect(r.isEmpty()).toEqual(false);
            r.reset();
            expect(r.isEmpty()).toEqual(true);
        });

        it("should print RDF/XML", function() {
            var flags = {hasRequired: false, loading: {}}, rdf;
            r.initializeProperty(pt, flags);
            r.addPropertyValue(pt, "urn:val");
            rdf = r.toRDF();
            expect(rdf).toMatch(/<?xml version="1.0"\?>/);
            expect(rdf).toMatch(/<rdf:RDF/);
            expect(rdf).toMatch(/xmlns:ns0="http:\/\/example.org\/"/);
            expect(rdf).toMatch(/rdf:about="urn:test-work"/);
            expect(rdf).toMatch(/rdf:resource="testAlt"/);
            expect(rdf).toMatch(/ns0:newprop rdf:resource="urn:val"/);
        });

        it("should print N3", function() {
            var flags = {hasRequired: false, loading: {}}, rdf;
            r.initializeProperty(pt, flags);
            r.addPropertyValue(pt, "urn:val");
            rdf = r.toN3();
            expect(rdf).toMatch(/@prefix rdf: <http/);
            expect(rdf).toMatch(/<http:\/\/example.org\/newprop> <urn:val>;/);
        });
    });
});
