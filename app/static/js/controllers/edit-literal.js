(function() {
    angular
        .module("bibframeEditor")
        .controller("EditLiteralController", EditLiteralController);

    function EditLiteralController($scope, $modalInstance, ResourceStore, property, literal) {
        $scope.resource = {"uri": "noop", "id": "noop"}; // @@@ kind of a hack
        $scope.setValueFromInput = function(a, b) {}; // @@@ ditto
        $scope.property = property.getProperty().getLabel();
        $scope.prop = property;
        $scope.inputted = {};
        $scope.inputted[property.generateFormID()] = literal;
        $scope.editExisting = true;
        $scope.pivoting = false;

        $scope.dataTypes = ResourceStore.getDataTypeByID;

        $scope.save = save;
        $scope.submit = save;
        $scope.cancel = cancel;

        function save() {
            $modalInstance.close($scope.inputted[$scope.prop.generateFormID()]);
        }

        function cancel() {
            $modalInstance.dismiss();
        }
    }
})();
