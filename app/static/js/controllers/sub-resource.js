(function() {
    angular
        .module("bibframeEditor")
        .controller("SubResourceController", SubResourceController);

    function SubResourceController($scope, $modalInstance, template, doInitialization) {
        $scope.inputted = {};
        $scope.editExisting = false;
        $scope.pivoting = true;
        $scope.popover = {
            "uri": null,
            "data": null
        };

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
