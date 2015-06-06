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

angular.module("storeService", ["ngResource"]).
    factory("Store", function($resource) {
        return $resource(
            "../resource/:action",
            {},
            {
                "id": {
                    "method": "POST",
                    "isArray": false,
                    "params": {
                        "action": "id"
                    }
                },
                "new": {
                    "method": "PUT",
                    "isArray": false,
                    "params": {
                        "action": "new",
                        "n3": "@n3"
                    }
                }
            }
        );
    }
);

angular.module("queryService", ["ngResource"]).
    factory("Query", function($resource) {
        return $resource(
            "../suggest/master?q=:q&services=:services",
            {},
            {
                "suggest": { "method": "GET", "isArray": true }
            }
        );
    }
);

angular.module("resolverService", ["ngResource"]).
    factory("Resolver", function($resource) {
        return $resource(
            "../resolver?r=:uri",
            {},
            {
                "resolve": {
                    "method": "GET",
                    "headers": { "Accept": "application/rdf+xml,text/rdf+n3" },
                    "transformResponse": function(data) {
                        return { "raw": data }; 
                    },
                    "isArray": false
                }
            }
        );
    }
);

angular.module("messageService", [])
    .factory("Message", function() {
        var Msg = function(msg, severity) {
            this.message = msg;
            this.severity = severity;
        };

        return {
            _messages: [],
            messages: function() {
                return this._messages;
            },
            addMessage: function(msg, severity) {
                this._messages.push(new Msg(msg, severity));
                console.log(msg);
            },
            removeMessage: function(idx) {
                this._messages.splice(idx, 1);
            }
        };
    }
);
