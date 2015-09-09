(function() {
    angular
        .module("bibframeEditor")
        .controller("SubResourceController", SubResourceController);

    function SubResourceController($scope, $modalInstance, template, doInitialization) {
        $scope.inputted = {};
        $scope.results = {};
        $scope.invalid = {};
        $scope.editExisting = false;
        $scope.pivoting = true;

        $scope.resource = {
            id: template.getID(),
            uri: template.getClassID(),
            label: template.getLabel(),
            disabled: false
        };

        $scope.cancel = cancel;
        $scope.save = save;
        $scope.submit = save;

        initialize();

        function initialize() {
            if (doInitialization) {
                $scope.current().initialize();
            }
        }

        function cancel() {
            $modalInstance.dismiss();
        }

        function save() {
            $modalInstance.close();
        }
    }
})();
