(function() {
    angular
        .module("bibframeEditor")
        .controller("SubResourceController", SubResourceController);

    function SubResourceController($scope, $modalInstance, $modal, template, doInitialization) {
        $scope.inputted = {};
        $scope.results = {};
        $scope.invalid = {};
        $scope.warnings = {};
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
            var invalid, names, i;
            invalid = $scope.validate(template, $scope.invalid);
            if (invalid.length === 0) {
                $modalInstance.close();
            } else {
                names = "";
                for (i = 0; i < invalid.length; i++) {
                    names += "<li>" + invalid[i].getProperty().getLabel() + "</li>";
                }
                $scope.warnings["message"] = "Please fill out all required properties before saving: <ul>" + names + "</ul>";
                $modal.open({
                    templateUrl: "show-warning.html",
                    scope: $scope
                });
            }
        }
    }
})();
