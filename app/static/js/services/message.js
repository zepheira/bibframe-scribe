(function() {
    "use strict";

    angular
        .module("messageService", [])
        .factory("Message", Message);

    function Msg(msg, severity) {
        this.message = msg;
        this.severity = severity;
    }

    function Message() {
        var service = {
            messages: messages,
            addMessage: addMessage,
            removeMessage: removeMessage
        };

        var _messages = [];

        return service;
        
        function messages() {
            return _messages;
        }

        function addMessage(msg, severity) {
            _messages.push(new Msg(msg, severity));
            console.log(msg);
        }

        function removeMessage(idx) {
            _messages.splice(idx, 1);
        }
    }
})();
