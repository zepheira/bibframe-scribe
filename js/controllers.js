/**
 * - track property instances to not go over maxOccurs
 * - export (what?)
 */

var EditorCtrl = function($scope, Configuration, Profiles, Subjects, Agents, Languages, Providers) {
    $scope.config = {};
    $scope.profiles = {};
    $scope.profileOptions = {};
    $scope.resourceServices = {};
    $scope.idToURI = {};
    $scope.complete = {};
    $scope.autocompletes = {};
    $scope.services = {
        "Subjects": Subjects,
        "Agents": Agents,
        "Languages": Languages,
        "Providers": Providers
    };

    $scope.currentWork = {};
    $scope.activeProfile = null;

    // initialize by retrieving configuration and profiles
    Configuration.get(null, null, function(response) {
        Profiles.get(
            {},
            {"profile": "vanilla", "format": "json"},
            function(resp) {
                var templates;
                templates = resp.Profile.resourceTemplate;
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
        angular.forEach($scope.config.resourceServiceMap, function(item) {
            angular.forEach(item.services, function(service) {
                if (typeof $scope.resourceServices[item.resource] !== "undefined") {
                    $scope.resourceServices[item.resource].push($scope.services[service]);
                } else {
                    $scope.resourceServices[item.resource] = [$scope.services[service]];
                }
            });
        });
    };

    $scope.newEdit = function(profile) {
        // @@@ check if form has contents, prompt to change
        $scope.activeProfile = $scope.profiles[profile.uri];
    };

    $scope.autocomplete = function(evt, property) {
        var classID, services, completer, typed;
        completer = property.getConstraint().getReference();
        classID = $scope.profiles[$scope.idToURI[completer]].getClassID();
        services = $scope.resourceServices[classID];
        typed = $(evt.currentTarget).val();
        if (typed.length > 1) {
            angular.forEach(services, function(service) {
                // @@@ handle multiple services correctly
                service.get(null, null, function(response) {
                    $scope.complete[completer] = true;
                    $scope.autocompletes = response.values;
                });
            });
        }
    };

    $scope.hasComplete = function(prop) {
        var completer = prop.getConstraint().getReference();
        if (typeof $scope.complete[completer] !== "undefined") {
            return $scope.complete[completer];
        } else {
            return false;
        }
    };

    $scope.reset = function() {
        $scope.currentWork = {};
    };

    $scope.abortAutocomplete = function() {
        $scope.autocompletes = {};
        $scope.complete = {};
    };

    $scope.selectValue = function(property, value) {
        $scope.autocompletes = {};
        $scope.complete = {};
    };
};

EditorCtrl.$inject = ["$scope", "Configuration", "Profiles", "Subjects", "Agents", "Languages", "Providers"];
