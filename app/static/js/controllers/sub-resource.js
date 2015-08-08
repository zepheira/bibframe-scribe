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
                var flags = { hasRequired: false, loading: {} };
                angular.forEach(template.getPropertyTemplates(), function(prop) {
                    $scope.current().initializeProperty(prop, flags);
                });
                $scope.setHasRequired(flags.hasRequired);
            }
            // @@@ need a way to ascertain if hasRequired is true if not initializating
        }

        function cancel() {
            $modalInstance.dismiss();
        }

        function save() {
            $modalInstance.close();
        }
    }
})();
