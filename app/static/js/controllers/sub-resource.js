(function() {
    angular
        .module("bibframeEditor")
        .controller("SubResourceController", SubResourceController);

    function SubResourceController($scope, $modalInstance, current, template, controller) {
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

        $scope.getReferenceResourceType = controller.getReferenceResourceType;
        $scope.editLiteral = controller.editLiteral;
        $scope.editResource = controller.editResource;
        $scope.showResource = controller.showResource;
        $scope.isLoading = controller.isLoading; // @@@ only works with EditorController
        $scope.reset = controller.reset; // @@@ ditto - not used?
        $scope.autocomplete = controller.autocomplete; // @@@ ditto
        $scope.selectValue = controller.selectValue; // @@@ ditto
        $scope.pivot = controller.pivot; // @@@ ditto?
        $scope.dataTypes = controller.dataTypes;
        $scope.setValueFromInput = controller.setValueFromInput;
        
        $scope.current = getCurrent;
        $scope.cancel = cancel;
        $scope.save = save;
        $scope.submit = save;

        initialize();

        function initialize() {
            var flags = { hasRequired: false, loading: {} };
            angular.forEach(template.getPropertyTemplates(), function(prop) {
                current.initializeProperty(prop, flags);
            });
            $scope.hasRequired = function() {
                return flags.hasRequired;
            }
        }

        function getCurrent() {
            return current;
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
            $modalInstance.close(current);
        }
    }
})();
