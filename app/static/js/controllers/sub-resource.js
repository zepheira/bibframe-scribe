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
            uri: template.getClassID(),
            label: template.getLabel(),
            disabled: false
        };
        $scope.getTemplateByClassID = getTemplateByClassID;

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

        /**
         * Replace the actual lookup (which only finds resource associated
         * with a first class) with a localized one that only returns the
         * passed-in template.
         */
        function getTemplateByClassID(id) {
            return template;
        }

        function cancel() {
            $modalInstance.dismiss();
        }

        function save() {
            $modalInstance.close();
        }
    }
})();
