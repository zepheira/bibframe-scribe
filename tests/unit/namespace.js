"use strict";

describe("Namespace", function() {
    describe("constructor", function() {
        var ns, a, b, c;
        beforeEach(function() {
            ns = new Namespace();
            a = "http://example.org/term";
            b = "http://example.org/tc";
            c = "http://example.net/#res";
        });
        
        it("should extract namespaces", function() {
            var an, bn, cn;
            an = ns.extractNamespace(a);
            expect(an.term).toEqual("term");
            expect(an.namespace).toEqual("ns0");
            bn = ns.extractNamespace(b);
            expect(bn.term).toEqual("tc");
            expect(bn.namespace).toEqual("ns0");
            cn = ns.extractNamespace(c);
            expect(cn.term).toEqual("res");
            expect(cn.namespace).toEqual("ns1");
        });
        
        it("should track seen namespaces", function() {
            expect(ns.fromNamespace("http://example.org/")).toEqual("ns0");
            expect(ns.fromNamespace("http://example.org/")).toEqual("ns0");
            expect(ns.fromNamespace("http://example.net/#")).toEqual("ns1");
        });
        
        it("should return a properly shortened RDF prolog", function() {
            ns.extractNamespace(a);
            ns.extractNamespace(c);
            expect(ns.buildRDF()).toEqual("<rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\" xmlns:ns0=\"http://example.org/\" xmlns:ns1=\"http://example.net/#\">");
        });
    });
});
