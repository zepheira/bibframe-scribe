(function() {
    angular
        .module("bibframeEditor")
        .controller("ShowResourceController", ShowResourceController);

    function ShowResourceController($scope, $modalInstance, rdf, label, uri) {
        $scope.rdf = rdf;
        $scope.label = label;
        $scope.uri = uri;
        $scope.close = close;
        
        function close() {
            $modalInstance.dismiss();
        }
    }
})();
