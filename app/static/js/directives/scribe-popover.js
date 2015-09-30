(function() {
    angular
        .module("bibframeEditor")
        .directive("scribePopover", ["$q", "$timeout", "$document", "$position", "Resolver", ScribePopoverDirective]);

    function ScribePopoverDirective($q, $timeout, $document, $position, Resolver) {
        function resolve(uri) {
            var deferred = $q.defer();
            Resolver.resolve({"uri": uri}).$promise.then(function(data) {
                deferred.resolve(data.raw);
            }).catch(function(data) {
                deferred.reject("No additional data could be found.");
            });
            return deferred.promise;
        }

        function getAttr(attrs, name) {
            var prefix = "scribePopover";
            if (angular.isDefined(attrs[prefix + name])) {
                return attrs[prefix + name];
            } else {
                return null;
            }
        }

        return {
            restrict: "A",
            link: function(scope, el, atts) {
                var delay, trigger, cancel, to, tt, ttClick, docClick, docType, show, stop, destroy;

                delay = parseInt(getAttr(atts, "Delay"), 10);
                trigger = getAttr(atts, "Trigger");
                cancel = getAttr(atts, "Cancel");
                to = null;

                show = function() {
                    if (!to) {
                        to = $timeout(function() {
                            resolve(getAttr(atts, "Resource")).then(function(h) {
                                var esc, pos;
                                $document.triggerHandler("scribePopoverOpened");
                                esc = h.replace(/</g,"&lt;").replace(/>/g,"&gt;");
                                // @@@ make this a template?
                                tt = angular.element('<div class="popover right resource"><div class="arrow"></div><p class="text-center"><a target="_blank" href="' + getAttr(atts, "Resource") + '"><code>&lt;' + getAttr(atts, "Resource") + '&gt;</code></a></p><p class="text-center"><small>Click the URI above to view a more reader-oriented version in a new window, or review the RDF below.</small></p><hr><pre>' + esc + '</pre></div>');
                                $document.find("body").append(tt);
                                tt.css({ top: 0, left: 0, display: "block" });
                                pos = $position.positionElements(el, tt, "right", true);
                                pos.top += "px";
                                pos.left += "px";
                                tt.css(pos);
                                // do not destroy if tt clicked directly
                                ttClick = tt.on("click", function(evt) {
                                    evt.stopPropagation();
                                });
                            });
                        }, delay, false);
                    }
                };

                stop = function() {
                    if (to) {
                        $timeout.cancel(to);
                        to = null;
                    }
                };

                destroy = function() {
                    stop();
                    if (tt) {
                        tt.unbind("click", ttClick);
                        $document.unbind("click", docClick);
                        $document.unbind("keypress", docType);
                        tt.remove();
                        tt = null
                    }
                };

                if (trigger !== null) {
                    el.bind(trigger, show);
                }

                if (cancel !== null) {
                    el.bind(cancel, stop);
                }

                docClick = $document.on("click", destroy);
                docType = $document.on("keypress", destroy);
                $document.on("scribePopoverOpened", destroy);
            }
        };
    }
})();
