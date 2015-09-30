(function() {
    angular
        .module("bibframeEditor")
        .directive("scribeEnter", ScribeEnterDirective);

    function ScribeEnterDirective() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if ((typeof event.code !== "undefined" && event.code === "Enter")
                    || (typeof event.which !== "undefined" && event.which === 13)
                    || (typeof event.keyCode !== "undefined" && event.keyCode === 13)) {
                    scope.$apply(function() {
                        scope.$eval(attrs.scribeEnter);
                    });
                    
                    event.preventDefault();
                }
            });
        };
    }
})();
