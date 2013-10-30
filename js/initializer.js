angular.module("bibframeEditor", [
    "ui.bootstrap",
    "profileServices",
    "configurationServices",
    "subjectServices",
    "agentServices",
    "languageServices",
    "providerServices"
]).directive("ngEnter", function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if (event.which === 13) {
                scope.$apply(function() {
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
}).directive("dropzone", function() {
    return function(scope, element, attrs) {
        scope.$watch('activeResource', function(newValue, oldValue) {
            if (newValue !== null && newValue.getClassID() === attrs.dzResource) {
                scope.cache.dz = new Dropzone("div.active div.dropzone", {
                    // @@@ provide this service - receives, stores, returns URI
                    "url": "/upload/image",
                    "autoProcessQueue": true,
                    "uploadMultiple": true,
                    "addRemoveLinks": true,
                    "parallelUploads": 100,
                    // max accepted files: for demo, all files are rejected due to no place to upload them to, and rejected files don't count towards total
                    "maxFiles": attrs.dzRepeatable ? 100 : 1,
                    // @@@ for demo purposes; when real, hook into success event
                    "accept": function(file, done) {
                        var imguri, prop;
                        prop = attrs.dzProperty;
                        imguri = scope.randomRDFID() + "/" + file.name;
                        scope.$apply(function() {
                            scope.flags.isDirty = true;
                            scope.currentWork[prop].push(new PredObject(file.name, imguri, "resource", true));
                            scope.created.push({
                                "id": imguri,
                                "type": new PredObject("", attrs.dzType, "resource", false)
                            });
                        });
                        done("Uploading not enabled in this prototype.");
                    },
                    "thumbnail": function(file) {
                        var props, resource;
                        props = scope.typeMap["dropzone"];
                        angular.forEach(scope.created, function(res) {
                            if (res.id.endsWith(file.name)) {
                                resource = res;
                            }
                        });
                        angular.forEach(props, function(val, prop) {
                            if (prop === "width") {
                                scope.$apply(function() {
                                    resource[val] = [new PredObject(file.width, file.width, "literal")];
                                });
                            } if (prop === "height") {
                                scope.$apply(function() {
                                    resource[val] = [new PredObject(file.height, file.height, "literal")];
                                });
                            }
                        });
                    },
                    "init": function() {
                        var dz = this;
                        this.on("maxfilesexceeded", function(file) {
                            // @@@ may need more notice than this
                            dz.removeFile(file);
                        });
                        this.on("removedfile", function(file) {
                            // @@@ works fine for removal, fails for removeAll
                            var prop = attrs.dzProperty;
                            angular.forEach(scope.currentWork[prop], function(val) {
                                if (val.getValue().endsWith(file.name)) {
                                    scope.$apply(function() {
                                        scope.removeValue(scope.currentWork, prop, val);
                                    });
                                }
                            });
                        });
                    }
                });
            }
        });
    };
});
