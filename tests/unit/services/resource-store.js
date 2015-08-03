"use strict";

describe("ResourceStore", function() {
    var ResourceStore, PropertyTemplate, Resource;

    beforeEach(module("bibframeEditor"));
    beforeEach(inject(function($injector) {
        ResourceStore = $injector.get("ResourceStore");
        PropertyTemplate = $injector.get("PropertyTemplate");
        Resource = $injector.get("Resource");
        ResourceStore.setIDBase("urn:id/");
    }));

    it("should get the current, unset resource", function() {
        expect(ResourceStore.getCurrent()).toBeNull();
    });

    it("should set an empty current resource", function() {
        ResourceStore.newResource();
        expect(ResourceStore.getCurrent()).not.toBeNull();
    });

    it("should set an empty current resource and its template", function() {
        ResourceStore.newResource();
        expect(ResourceStore.getCurrent().getTemplate()).toBeUndefined();
        ResourceStore.setResourceTemplate({
            getClassID: function() {
                return "test";
            }
        });
        expect(ResourceStore.getCurrent().getTemplate()).not.toBeNull();
    });

    it("should return empty created list", function() {
        expect(ResourceStore.getCreated().length).toEqual(0);
    });

    it("should add to created list", function() {
        ResourceStore.addCreated({});
        expect(ResourceStore.getCreated().length).toEqual(1);
    });

    it("should have no required properties when empty", function() {
        expect(ResourceStore.hasRequired()).toEqual(false);
    });

    it("should set and have a required property", function() {
        ResourceStore.setHasRequired(true)
        expect(ResourceStore.hasRequired()).toEqual(true);
    });

    it("should have no loading properties when empty", function() {
        expect(ResourceStore.getAllLoading()).toEqual({});
        expect(ResourceStore.isLoading("urn:test")).toEqual(false);
    });

    it("should set a loading property", function() {
        expect(ResourceStore.isLoading("urn:test")).toEqual(false);
        ResourceStore.setLoading("urn:test", true);
        expect(ResourceStore.isLoading("urn:test")).toEqual(true);
        ResourceStore.setLoading("urn:test", false);
        expect(ResourceStore.isLoading("urn:test")).toEqual(false);
    });

    it("should not return an active template", function() {
        expect(ResourceStore.getActiveTemplate()).toBeNull();
    });

    it("should set and return an active template", function() {
        ResourceStore.setActiveTemplate({});
        expect(ResourceStore.getActiveTemplate()).toEqual({});
    });

    it("should return an empty set of flags", function() {
        expect(ResourceStore.getFlags()).toEqual({});
    });

    it("should modify and return modified flags", function() {
        var f = ResourceStore.getFlags();
        f["prop"] = true;
        expect(ResourceStore.getFlags()).toEqual({prop: true});
    });

    it("should return an empty set of data type handlers", function() {
        expect(ResourceStore.getDataTypes()).toEqual({});
    });

    it("should add a data type handlers", function() {
        ResourceStore.addDataTypeHandler("test", {});
        expect(ResourceStore.getDataTypes()).toEqual({test: {}});
        expect(ResourceStore.getDataTypeByID("test")).toEqual({});
    });

    it("should return a null dropzone", function() {
        expect(ResourceStore.getDropzone()).toBeNull();
    });

    it("should set cached dropzone", function() {
        ResourceStore.cacheDropzone({});
        expect(ResourceStore.getDropzone()).toEqual({});
    });

    it("should set cached dropzone", function() {
        var dz = {
            removeAllFiles: function() {}
        };
        spyOn(dz, "removeAllFiles");
        ResourceStore.newResource();
        ResourceStore.cacheDropzone(dz);
        ResourceStore.reset();
        expect(dz.removeAllFiles).toHaveBeenCalled();
    });

    it("should reset the current resource to unedited state", function() {
        var flags, pt;
        flags = {hasRequired: false, loading: {}};
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
        ResourceStore.newResource();
        ResourceStore.getCurrent().initializeProperty(pt, flags);
        expect(ResourceStore.getCurrent().isEmpty()).toEqual(true);
        ResourceStore.getCurrent().addPropertyValue(pt, "urn:val");
        expect(ResourceStore.getCurrent().isEmpty()).toEqual(false);
        ResourceStore.reset();
        expect(ResourceStore.getCurrent().isEmpty()).toEqual(true);
    });

    it("should clear current resouce store environment", function() {
        var flags, pt, dz;
        flags = {hasRequired: false, loading: {}};
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
        dz = {
            destroy: function() {}
        }
        spyOn(dz, "destroy");

        expect(ResourceStore.getCurrent()).toBeNull();
        expect(ResourceStore.getDropzone()).toBeNull();
        expect(ResourceStore.hasRequired()).toEqual(false);
        expect(ResourceStore.getFlags()).toEqual({});
        expect(ResourceStore.getAllLoading()).toEqual({});

        ResourceStore.newResource();
        ResourceStore.getCurrent().initializeProperty(pt, flags);
        ResourceStore.getCurrent().addPropertyValue(pt, "urn:val");
        ResourceStore.setHasRequired(true);
        ResourceStore.cacheDropzone(dz);
        expect(ResourceStore.getCurrent()).not.toBeNull();
        expect(ResourceStore.getDropzone()).not.toBeNull();
        expect(ResourceStore.hasRequired()).toEqual(true);

        ResourceStore.clear();
        expect(ResourceStore.getCurrent().isEmpty()).toEqual(true);
        expect(ResourceStore.getDropzone()).toBeNull();
        expect(dz.destroy).toHaveBeenCalled();
        expect(ResourceStore.hasRequired()).toEqual(false);
        expect(ResourceStore.getFlags()).toEqual({});
        expect(ResourceStore.getAllLoading()).toEqual({});
    });

    describe("pivoting", function() {
        var r;

        beforeEach(function() {
            ResourceStore.newResource();
            r = new Resource("urn:example");
            r.setID("urn:test");
        });

        it("should pivot to a new resource", function() {
            ResourceStore.pivot(r);
            expect(ResourceStore.getCurrent()).toEqual(r);
        });

        it("should restore the original state and store the result from the pivoted state", function() {
            ResourceStore.pivot(r);
            ResourceStore.setHasRequired(true);
            ResourceStore.pivotDone();
            expect(ResourceStore.getCreated().length).toEqual(1);
            expect(ResourceStore.getCurrent()).not.toEqual(r);
            expect(ResourceStore.hasRequired()).toEqual(false);
        });
    });

});
