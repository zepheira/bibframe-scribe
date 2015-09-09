(function() {
    angular
        .module("messageService", [])
        .factory("Message", ["$sce", Message]);

    function Message($sce) {
        var service, _messages;

        service = {
            messages: messages,
            addMessage: addMessage,
            removeMessage: removeMessage
        };

        _messages = [];

        return service;
        
        function messages() {
            return _messages;
        }

        function addMessage(msg, severity) {
            _messages.push(new Msg($sce.trustAsHtml(msg), severity));
        }

        function removeMessage(idx) {
            _messages.splice(idx, 1);
        }
    }

    function Msg(msg, severity) {
        this.message = msg;
        this.severity = severity;
    }
})();
