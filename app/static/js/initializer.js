angular.module("bibframeEditor", [
    "ui.bootstrap",
    "profilesService",
    "configurationService",
    "storeService",
    "queryService",
    "messageService",
    "http-throttler",
    "resolverService",
    "namespaceService",
    "progressService",
    "propertyFactory",
    "predObjectFactory",
    "valueConstraintFactory",
    "propertyTemplateFactory",
    "resourceTemplateFactory",
    "resourceFactory",
    "profileFactory"
]).config(["$httpProvider", function($httpProvider) {
    $httpProvider.interceptors.push("httpThrottler");
}]).directive("ngEnter", function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if ((typeof event.code !== "undefined" && event.code === "Enter")
                || (typeof event.which !== "undefined" && event.which === 13)
                || (typeof event.keyCode !== "undefined" && event.keyCode === 13)) {
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
                scope.cache.dz = new Dropzone(element[0], {
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
                    // @@@ hack. need to start an $apply cycle when clicked,
                    // otherwise using $apply in the removedfile listener
                    // conflicts between click-usage and reset usage, which
                    // already takes place in an $apply cycle.
                    "addedfile": function(file) {
                        var _this = this, ret;
                        file.previewElement = Dropzone.createElement(this.options.previewTemplate);
                        file.previewTemplate = file.previewElement;
                        this.previewsContainer.appendChild(file.previewElement);
                        file.previewElement.querySelector("[data-dz-name]").textContent = file.name;
                        file.previewElement.querySelector("[data-dz-size]").innerHTML = this.filesize(file.size);
                        if (this.options.addRemoveLinks) {
                            file._removeLink = Dropzone.createElement("<a class=\"dz-remove\" href=\"javascript:undefined;\">" + this.options.dictRemoveFile + "</a>");
                            file._removeLink.addEventListener("click", function(e) {
                                e.preventDefault();
                                e.stopPropagation();
                                if (file.status === Dropzone.UPLOADING) {
                                    return Dropzone.confirm(_this.options.dictCancelUploadConfirmation, function() {
                                        scope.$apply(function() {
                                            ret = _this.removeFile(file);
                                        });
                                        return ret;
                                    });
                                } else {
                                    if (_this.options.dictRemoveFileConfirmation) {
                                        return Dropzone.confirm(_this.options.dictRemoveFileConfirmation, function() {
                                            scope.$apply(function() {
                                                ret = _this.removeFile(file);
                                            });
                                            return ret;
                                        });
                                    } else {
                                        scope.$apply(function() {
                                            ret = _this.removeFile(file);
                                        });
                                        return ret;
                                    }
                                }
                            });
                            file.previewElement.appendChild(file._removeLink);
                        }
                        return this._updateMaxFilesReachedClass();
                    },
                    "init": function() {
                        var dz = this;
                        this.on("thumbnail", function(file) {
                            var props, resource;
                            props = scope.typeMap["dropzone"];
                            angular.forEach(scope.created, function(res) {
                                if (res.id.endsWith(file.name)) {
                                    resource = res;
                                }
                            });
                            angular.forEach(props, function(val, prop) {
                                if (prop === "filename") {
                                    scope.$apply(function() {
                                        resource[val] = [new PredObject(file.name, file.name, "literal")];
                                    });
                                } else if (prop === "mimetype") {
                                    scope.$apply(function() {
                                        resource[val] = [new PredObject(file.type, file.type, "literal")];
                                    });
                                } else if (prop === "width") {
                                    scope.$apply(function() {
                                        resource[val] = [new PredObject(file.width, file.width, "literal")];
                                    });
                                } else if (prop === "height") {
                                    scope.$apply(function() {
                                        resource[val] = [new PredObject(file.height, file.height, "literal")];
                                    });
                                }
                            });
                        });
                        this.on("maxfilesexceeded", function(file) {
                            // @@@ may need more notice than this
                            dz.removeFile(file);
                        });
                        this.on("removedfile", function(file) {
                            var prop = attrs.dzProperty;
                            angular.forEach(scope.currentWork[prop], function(val) {
                                if (val.getValue().endsWith(file.name)) {
                                    scope.removeValue(scope.currentWork, prop, val);
                                }
                            });
                        });
                    }
                });
            }
        });
    };
});
