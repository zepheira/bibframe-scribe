var Namespace = function() {
    this._tracker = 0;
    this._map = {};
};

/**
 * Quick and dirty namespace extraction.  Deals only with # and / as
 * separators, expects some sort of protocol prefix ending with ://.
 * @param {String} uri
 * @returns {Object}
 */
Namespace.prototype.extractNamespace = function(uri) {
    var lastSlash, lastHash, protocol, ns, term, extracted;
    ns = null;
    protocol = uri.substr(0, uri.indexOf("://") + 3);
    uri = uri.substr(uri.indexOf("://") +3);
    lastSlash = uri.lastIndexOf("/");
    lastHash = uri.lastIndexOf("#");
    if (lastSlash > 0 || lastHash > 0) {
        ns = protocol + uri.substr(0, Math.max(lastSlash, lastHash) + 1);
    }
    term = uri.substr(Math.max(lastSlash, lastHash) + 1);
    extracted = {"namespace": this.fromNamespace(ns), "term": term};
    return extracted;
};

/**
 * Get short namespace, or add new if not already being tracked.
 * @param {String} ns
 * @returns {String}
 */
Namespace.prototype.fromNamespace = function(ns) {
    if (typeof this._map[ns] !== "undefined") {
        return this._map[ns];
    } else {
        this._map[ns] = "ns" + this._tracker++;
        return this._map[ns];
    }
};

Namespace.prototype.buildRDF = function() {
    var ns, str;
    str = '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"'
    for (ns in this._map) {
        if (this._map.hasOwnProperty(ns)) {
            str += ' xmlns:' + this._map[ns] + '="' + ns + '"';
        }
    }
    return str + ">";
};
