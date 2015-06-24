"use strict";

describe("Namespace", function() {
    var Namespace;
    beforeEach(module("bibframeEditor"));
    beforeEach(inject(function($injector) {
        Namespace = $injector.get("Namespace");
    }));

    describe("constructor", function() {
        var a, b, c;
        beforeEach(function() {
            a = "http://example.org/term";
            b = "http://example.org/tc";
            c = "http://example.net/#res";
        });
        
        it("should extract namespaces", function() {
            var an, bn, cn;
            an = Namespace.extractNamespace(a);
            expect(an.term).toEqual("term");
            expect(an.namespace).toEqual("ns0");
            bn = Namespace.extractNamespace(b);
            expect(bn.term).toEqual("tc");
            expect(bn.namespace).toEqual("ns0");
            cn = Namespace.extractNamespace(c);
            expect(cn.term).toEqual("res");
            expect(cn.namespace).toEqual("ns1");
        });
        
        it("should track seen namespaces", function() {
            expect(Namespace.fromNamespace("http://example.org/")).toEqual("ns0");
            expect(Namespace.fromNamespace("http://example.org/")).toEqual("ns0");
            expect(Namespace.fromNamespace("http://example.net/#")).toEqual("ns1");
        });
        
        it("should return a properly shortened RDF prolog", function() {
            Namespace.extractNamespace(a);
            Namespace.extractNamespace(c);
            expect(Namespace.buildRDF()).toEqual("<rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\" xmlns:ns0=\"http://example.org/\" xmlns:ns1=\"http://example.net/#\">");
        });
    });
});
