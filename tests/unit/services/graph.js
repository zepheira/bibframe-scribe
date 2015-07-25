"use strict";

describe("Graph", function() {
    var Graph, TemplateStore, Message, $q, scope, sloader, floader;

    beforeEach(module("bibframeEditor"));
    beforeEach(inject(function($injector, _$q_, _$rootScope_) {
        $q = _$q_;
        scope = _$rootScope_;
        Graph = $injector.get("Graph");
        Message = $injector.get("Message");
        TemplateStore = $injector.get("TemplateStore");
        sloader = [Graph.load({firstClass: ["urn:test"]}, "<urn:a> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <urn:test> .", ""), Graph.load({firstClass: ["urn:test"]}, "<urn:b> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <urn:test> .", "")];
        floader = [Graph.load({}, "@#*", "urn:test")];
    }));

    it("should return an RDF store", function() {
        expect(typeof Graph.getStore().rdf).not.toEqual("undefined");
        expect(typeof Graph.getStore().rdf.api).not.toEqual("undefined");
    });

    it("should have registered subclasses", function(done) {
        $q.all(sloader).then(function() {
            expect(TemplateStore.getResourceFirstClass("urn:a")).toEqual("urn:test");
            expect(TemplateStore.getResourceFirstClass("urn:b")).toEqual("urn:test");
        }).finally(done);
        setInterval(scope.$digest, 100);
    });

    it("should fail to load malformed N3", function(done) {
        $q.all(floader).catch(function() {
            expect(Message.messages().length).toEqual(1);
            expect(Message.messages()[0].message).toMatch(/Error/);
            expect(Message.messages()[0].message).toMatch(/urn:test/);
        }).finally(done);
        setInterval(scope.$digest, 100);
    });

    it("should execute a query and return values via promise", function(done) {
        $q.all(sloader).then(function() {
           Graph.execute({}, "SELECT ?p WHERE { ?s ?p <urn:test> }").then(function(response) {
               expect(response[0]).toEqual({});
               expect(response[1].length).toEqual(2);
               expect(response[1][0].p.value).toEqual("http://www.w3.org/2000/01/rdf-schema#subClassOf");
           });
        }).finally(done);
        setInterval(scope.$digest, 100);
    });
});
