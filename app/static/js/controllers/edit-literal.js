(function() {
    angular
        .module("bibframeEditor")
        .controller("EditLiteralController", EditLiteralController);

    function EditLiteralController($scope, $modalInstance, property, literal, dataTypes, resource, setDateValue, setTextValue, currentWork) {
        $scope.property = property.getProperty().getLabel();
        $scope.prop = property;
        $scope.dataTypes = dataTypes;
        $scope.resource = resource;
        $scope.setDateValue = setDateValue;
        $scope.setTextValue = setTextValue;
        $scope.currentWork = currentWork;
        $scope.inputted = {};
        $scope.inputted[property.getProperty().getID()] = literal;
        $scope.editExisting = true;
        $scope.pivoting = false;
        $scope.save = save;
        $scope.cancel = cancel;

        function save() {
            $modalInstance.close($scope.inputted[$scope.prop.getProperty().getID()]);
        }

        function cancel() {
            $modalInstance.dismiss();
        }
    }
})();
