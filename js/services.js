angular.module("profileServices", ["ngResource"]).
    factory("Profiles", function($resource) {
        return $resource(
            "./profiles/:profile.:format",
            {
                "profile": "@profile",
                "format": "@format"
            },
            {
                "get": { "method": "GET", "isArray": false }
            }
        );
    }
);

angular.module("configurationServices", ["ngResource"]).
    factory("Configuration", function($resource) {
        return $resource(
            "./config.json",
            {},
            {
                "get": { "method": "GET", "isArray": false }
            }
        );
    }
);

angular.module("subjectServices", ["ngResource"]).
    factory("Subjects", function($resource) {
        return $resource(
            "./authority/subjects.json",
            {},
            {
                "get": { "method": "GET", "isArray": false }
            }
        );
    }
);

angular.module("agentServices", ["ngResource"]).
    factory("Agents", function($resource) {
        return $resource(
            "./authority/agents.json",
            {},
            {
                "get": { "method": "GET", "isArray": false }
            }
        );
    }
);

angular.module("languageServices", ["ngResource"]).
    factory("Languages", function($resource) {
        return $resource(
            "./authority/iso639-2.en.json",
            {},
            {
                "get": { "method": "GET", "isArray": false }
            }
        );
    }
);

angular.module("providerServices", ["ngResource"]).
    factory("Providers", function($resource) {
        return $resource(
            "./authority/providers.json",
            {},
            {
                "get": { "method": "GET", "isArray": false }
            }
        );
    }
);
