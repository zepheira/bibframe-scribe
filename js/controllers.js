var EditorCtrl = function($scope, Configuration, Profiles, Subjects, Agents, Languages, Providers) {
    $scope.config = {};
    $scope.profiles = {};
    $scope.profileOptions = {};
    $scope.resourceServices = {};
    $scope.idToURI = {};
    $scope.autocompleteLoading = {};
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
        // interpret configuration for labels and classes to use out of profile
        angular.forEach($scope.config.useClasses, function(item) {
            angular.forEach($scope.profiles, function(profile) {
                if (profile.getClassID() === item.id) {
                    $scope.profileOptions[item.id] = {};
                    $scope.profileOptions[item.id].uri = item.id;
                    $scope.profileOptions[item.id].label = item.label;
                }
            });
        });

        // interpret configuration for resource types to lookup services
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
        var conf, has;
        conf = false;
        has = false;
        angular.forEach($scope.currentWork, function(v) {
            if (typeof v === "object") {
                if (v.length > 0) {
                    has = true;
                }
            } else {
                has = true;
            }
        });
        if (has) {
            conf = confirm("You've started to catalog this item, really switch to different type?");
        }
        if (!has || conf) {
            $scope.currentWork = {};
            $scope.activeProfile = $scope.profiles[profile.uri];
            angular.forEach($scope.activeProfile.getPropertyTemplates(), function(prop) {
                $scope.initializeProperty(prop);
            });
            return true;
        } else {
            // @@@ prevent tab from switching
            return false;
        }
    };

    $scope.autocomplete = function(property, typed) {
        var classID, services, completer;
        completer = property.getConstraint().getReference();
        classID = $scope.profiles[$scope.idToURI[completer]].getClassID();
        services = $scope.resourceServices[classID];
        // @@@ handle multiple services - or maybe have a proxied
        //     endpoint local to this host that does all the service
        //     handling, with arguments for which services to query
        return services[0].get({"search": typed}).$promise.then(function(response) {
            // @@@ matching should be handled by the service, just
            //     use response when it's implemented
            var matches = [];
            angular.forEach(response.values, function(val) {
                if (val.label.toLowerCase().indexOf(typed.toLowerCase()) >= 0) {
                    matches.push(val);
                }
            });
            return matches;
        });
    };

    $scope.completeLoading = function(prop) {
        console.log('asdf');
        return $scope.autocompleteLoading[prop.getProperties()[0].getID()];
    };

    $scope.reset = function() {
        angular.forEach($scope.currentWork, function(p, key) {
            $scope.currentWork[key] = [];
        });
    };

    $scope.randomRDFID = function() {
        return "http://example.org/" + Math.floor(Math.random()*1000000);
    };

    $scope.exportRDF = function() {
        // @@@ may want a basic triple API library for this instead
        //     of generating strings
        var subj, rdf, tail;
        subj = $scope.randomRDFID(); // @@@ should be a service
        rdf = '<?xml version="1.0"?>\n\n<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:bf="http://bibframe.org/vocab/" xmlns:bfp="http://bibframe.org/vocab/proposed/">\n  <rdf:Description rdf:about="' + subj + '">\n';
        tail = '  </rdf:Description>\n</rdf:RDF>\n';
        rdf += '    <rdf:type rdf:resource="' + $scope.activeProfile.getClassID() + '"/>\n';
        angular.forEach($scope.currentWork, function(vals, prop) {
            var nsProp;
            nsProp = prop.replace(/http\:\/\/bibframe\.org\/vocab\/proposed\//, "bfp:");
            nsProp = nsProp.replace(/http\:\/\/bibframe\.org\/vocab\//, "bf:");
            angular.forEach(vals, function(val) {
                // @@@ put directly into value or pick out of properties
                //     whether the value is a literal or a resource
                rdf += '    <' + nsProp + ' rdf:resource="' + val.value + '"/>\n';
            });
        });
        console.log(rdf+tail);
    };

    $scope.selectValue = function(property, selection) {
        var seen = false;
        $scope.autocompletes = {};
        $scope.complete = {};
        prop = property.getProperties()[0].getID();
        angular.forEach($scope.currentWork[prop], function(val) {
            if (selection.uri === val.value) {
                seen = true;
            }
        });
        if (!seen) {
            $scope.currentWork[prop].push({"label": selection.label, "value": selection.uri});
        }
        console.log($scope.currentWork);
    };

    $scope.initializeProperty = function(property) {
        var prop;
        prop = property.getProperties()[0].getID();
        if (typeof $scope.currentWork[prop] === "undefined") {
            $scope.currentWork[prop] = [];
        }
    };
};

EditorCtrl.$inject = ["$scope", "Configuration", "Profiles", "Subjects", "Agents", "Languages", "Providers"];
