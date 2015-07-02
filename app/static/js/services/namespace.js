/**
 * Deprecated.  Hack for exporting RDF/XML, should be done on server side..
 */
(function() {
    angular
        .module("namespaceService", [])
        .factory("Namespace", Namespace);

    function Namespace() {
        var service, _tracker, _map;
        service = {
            extractNamespace: extractNamespace,
            fromNamespace: fromNamespace,
            buildRDF: buildRDF
        };

        _tracker = 0;
        _map = {};

        return service;

        /**
         * Quick and dirty namespace extraction.  Deals only with # and / as
         * separators, expects some sort of protocol prefix ending with ://.
         * @param {String} uri
         * @returns {Object}
         */
        function extractNamespace(uri) {
            var lastSlash, lastHash, lastColon, prIdx, protocol, ns, term, extracted;
            ns = null;
            protocol = "";
            prIdx = uri.indexOf("://");
            if (prIdx >= 0) {
                protocol = uri.substr(0, uri.indexOf("://") + 3);
                uri = uri.substr(uri.indexOf("://") + 3);
            }
            lastSlash = uri.lastIndexOf("/");
            lastHash = uri.lastIndexOf("#");
            lastColon = uri.lastIndexOf(":");
            if (lastSlash > 0 || lastHash > 0 || lastColon > 0) {
                ns = protocol + uri.substr(0, Math.max(lastSlash, lastHash, lastColon) + 1);
                term = uri.substr(Math.max(lastSlash, lastHash, lastColon) + 1);
                extracted = {"namespace": fromNamespace(ns), "term": term};
            } else {
                extracted = {"namespace": null, "term": uri};
            }
            return extracted;
        }
    
        /**
         * Get short namespace, or add new if not already being tracked.
         * @param {String} ns
         * @returns {String}
         */
        function fromNamespace(ns) {
            if (typeof _map[ns] !== "undefined") {
                return _map[ns];
            } else {
                _map[ns] = "ns" + _tracker++;
                return _map[ns];
            }
        }

        function buildRDF() {
            var ns, str;
            str = '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"'
            for (ns in _map) {
                if (_map.hasOwnProperty(ns)) {
                    str += ' xmlns:' + _map[ns] + '="' + ns + '"';
                }
            }
            return str + ">";
        }
    }
})();
