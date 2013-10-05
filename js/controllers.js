/**
 * - track property instances to not go over maxOccurs
 * - export (what?)
 */

var EditorCtrl = function($scope, Configuration, Profiles) {
    $scope.config = {};
    $scope.profiles = {};
    $scope.profileOptions = {};
    $scope.idToURI = {};

    $scope.activeProfile = null;

    // initialize by retrieving configuration and profiles
    Configuration.get(null, null, function(response) {
        Profiles.get(
            {},
            {"profile": "vanilla", "format": "json"},
            function(response) {
                var templates;
                templates = response.Profile.resourceTemplate;
                angular.forEach(templates, function(template) {
                    $scope.profiles[template.class.id] = new ResourceTemplate(template);
                    $scope.idToURI[template.id] = template.class.id;
                });
                $scope.initialize();
            }
        );
        $scope.config = response;
    });

    $scope.initialize = function() {
        angular.forEach($scope.config.useClasses, function(item) {
            angular.forEach($scope.profiles, function(profile) {
                if (profile.getClassID() === item.id) {
                    $scope.profileOptions[item.id] = {};
                    $scope.profileOptions[item.id].uri = item.id;
                    $scope.profileOptions[item.id].label = item.label;
                }
            });
        });
    };

    $scope.newEdit = function(profile) {
        // @@@ check if form has contents, prompt to change
        $scope.activeProfile = $scope.profiles[profile.uri];
    };
};

EditorCtrl.$inject = ["$scope", "Configuration", "Profiles"];
