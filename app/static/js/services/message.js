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
