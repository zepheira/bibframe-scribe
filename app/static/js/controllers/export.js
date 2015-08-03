(function() {
    angular
        .module("bibframeEditor")
        .controller("ExportController", ExportController);

    function ExportController($scope, $modalInstance, rdf) {
        $scope.rdf = rdf;
        $scope.close = close;
        
        function close() {
            $modalInstance.dismiss();
        }
    }
})();
