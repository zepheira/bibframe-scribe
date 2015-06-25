(function() {
    angular
        .module("bibframeEditor")
        .controller("SubResourceController", SubResourceController);

    function SubResourceController($scope, $modalInstance, templates, dataTypes, res, initProp, setTextValue, setDateValue, removeValue, editLiteral, editResource, currentWork, created, idToTemplate, pivot) {
        $scope.initializeProperty = initProp;
        $scope.setTextValue = setTextValue;
        $scope.setDateValue = setDateValue;
        $scope.removeValue = removeValue;
        $scope.editLiteral = editLiteral;
        $scope.editResource = editResource;
        $scope.pivot = pivot;
        $scope.resourceTemplates = templates;
        $scope.dataTypes = dataTypes;
        $scope.typeLabel = templates[res].getLabel();
        $scope.idToTemplate = idToTemplate;
        $scope.resource = {
            'uri': res,
            'label': templates[res].getLabel(),
            'disabled': false
        };
        $scope.currentWork = currentWork;
        $scope.created = created;
        $scope.flags = {
            isDirty: false
        };
        $scope.pivoting = true;
        $scope.editExisting = false;
        $scope.loading = {};
        $scope.inputted = {};
        $scope.hasRequired = false;

        $scope.cancel = cancel;
        $scope.save = save;

        initialize();

        function initialize() {
            var flags;
            flags = { "hasRequired": false, "loading": $scope.loading };
            angular.forEach(templates[res].getPropertyTemplates(), function(prop) {
                $scope.initializeProperty($scope.currentWork, prop, flags);
            });
            $scope.hasRequired = flags.hasRequired;
        }

        function cancel() {
            $modalInstance.dismiss();
        }

        function save() {
            $scope.currentWork.type = new PredObject(templates[res].getClassID(), templates[res].getClassID(), "resource", false);
            $modalInstance.close($scope.currentWork);
        }
    }
})();
