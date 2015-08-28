(function() {
    angular
        .module("bibframeEditor", [
            "ui.bootstrap",
            "http-throttler",
            "profileLoadService",
            "schemasService",
            "configurationLoadService",
            "storeService",
            "identifierService",
            "queryService",
            "graphService",
            "configurationService",
            "messageService",
            "resolverService",
            "namespaceService",
            "progressService",
            "propertyFactory",
            "predObjectFactory",
            "valueConstraintFactory",
            "propertyTemplateFactory",
            "resourceTemplateFactory",
            "resourceFactory",
            "profileFactory",
            "resourceStoreService",
            "templateStoreService"
        ])
        .config(["$httpProvider", function($httpProvider) {
            $httpProvider.interceptors.push("httpThrottler");
        }])
        .config(["$locationProvider", function($locationProvider) {
            $locationProvider.html5Mode({
                enabled: true,
                requireBase: false
            });
        }])
        .filter("unsafe", ["$sce", function($sce) {
            return function(val) {
                return $sce.trustAsHtml(val);
            };
        }]);
})();
