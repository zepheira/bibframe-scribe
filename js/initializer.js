angular.module("bibframeEditor", [
    "ui.bootstrap",
    "profileServices",
    "configurationServices",
    "subjectServices",
    "agentServices",
    "languageServices",
    "providerServices"
]).directive("ngInitializeProperty", function($compile) {
    return {
        "compile": function(tEl, tAttr) {
            tEl[0].removeAttribute("ng-initialize-property");
            return function(scope) {
                scope.$eval(tAttr.ngInitializeProperty);
                $compile(tEl[0])(scope);
            };
        }
    };
});
