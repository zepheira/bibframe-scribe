Q = require('q');

var instanceWork = {
    "http://bibframe.org/vocab/ElectronicDissertation": "http://bibframe.org/vocab/Dissertation",
    "http://bibframe.org/vocab/PrintDissertation": "http://bibframe.org/vocab/Dissertation",
    "http://bibframe.org/vocab/ElectronicBook": "http://bibframe.org/vocab/Book",
    "http://bibframe.org/vocab/PrintBook": "http://bibframe.org/vocab/Book",
    "http://bibframe.org/vocab/ElectronicBibliography": "http://bibframe.org/vocab/Bibliography",
    "http://bibframe.org/vocab/PrintBibliography": "http://bibframe.org/vocab/Bibliography",
    "http://bibframe.org/vocab/proposed/Vinyl": "http://bibframe.org/vocab/Audio",
    "http://bibframe.org/vocab/Painting": "http://bibframe.org/vocab/Image",
};

module.exports = {
    split: function(id, store) {
        var queryInstance, queryWork, deferred;
        deferred = Q.defer();

        queryInstance = 'SELECT * { <' + id + '> ?p ?o . FILTER(?p IN(<http://bibframe.org/vocab/ISBN10>,<http://bibframe.org/vocab/ISBN13>,<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>,<http://bibframe.org/vocab/isInstanceOf>,<http://bibframe.org/vocab/provider>,<http://bibframe.org/vocab/carrierCategory>,<http://bibframe.org/vocab/mediaCategory>,<http://bibframe.org/vocab/edition>,<http://bibframe.org/vocab/editionResponsibility>,<http://bibframe.org/vocab/lccn>,<http://bibframe.org/vocab/link>,<http://bibframe.org/vocab/dimensions>)) . }';
        queryWork = 'SELECT * { <' + id + '> ?p ?o . FILTER(?p IN(<http://bibframe.org/vocab/titleStatement>,<http://bibframe.org/vocab/workTitleRemained>,<http://bibframe.org/vocab/proposed/author>,<http://bibframe.org/vocab/proposed/editor>,<http://bibframe.org/vocab/proposed/contributor>,<http://bibframe.org/vocab/proposed/translator>,<http://bibframe.org/vocab/proposed/illustrator>,<http://bibframe.org/vocab/contentCategory>,<http://bibframe.org/vocab/contentsNote>,<http://bibframe.org/vocab/language>,<http://bibframe.org/vocab/notes>,<http://bibframe.org/vocab/subject>,<http://bibframe.org/vocab/otherEdition>,<http://bibframe.org/vocab/isEditionOf>,<http://bibframe.org/vocab/isTranslationOf>,<http://bibframe.org/vocab/hasTranslation>,<http://bibframe.org/vocab/isVersionOf>,<http://bibframe.org/vocab/hasVersion>,<http://bibframe.org/vocab/isVariantOf>,<http://bibframe.org/vocab/hasVariant>,<http://bibframe.org/vocab/isBasedOn>,<http://bibframe.org/vocab/isBasisFor>)) . }';

        store.execute(queryInstance, function(success, results) {
            var i, namespacer, nsProp, answer, head, tail, type;
            namespacer = new Namespace();
            head = '<?xml version="1.0"?>\n\n';
            tail = '</rdf:RDF>\n';
            answer = '    <rdf:Description rdf:about="' + id + '">\n';
            if (success) {
                for (i = 0; i < results.length; i++) {
                    nsProp = namespacer.extractNamespace(results[i].p.value);
                    if (nsProp.term === "type") {
                        type = results[i].o.value;
                    }
                    if (results[i].o.token === "uri") {
                        answer += '        <' + nsProp.namespace + ':' + nsProp.term + ' rdf:resource="' + results[i].o.value + '"/>\n';
                    } else {
                        answer += '        <' + nsProp.namespace + ':' + nsProp.term+ '>' + results[i].o.value + '</' + nsProp.namespace + '>\n';
                    }
                }
                answer += '    </rdf:Description>\n';

                store.execute(queryWork, function(success, workResp) {
                    var j, answerWork, workId;
                    workId = "http://example.org/work" + id.split(/\/id/)[1].substr(0, 8);
                    answerWork = '\n    <rdf:Description rdf:about="' + workId + '">\n';
                    answerWork += '        <rdf:type rdf:about="' + instanceWork[type] + '"/>\n';
                    if (success) {
                        for (j = 0; j < workResp.length; j++) {
                            nsProp = namespacer.extractNamespace(workResp[j].p.value);
                            if (workResp[j].o.token === "uri") {
                                answerWork += '        <' + nsProp.namespace + ':' + nsProp.term + ' rdf:resource="' + workResp[j].o.value + '"/>\n';
                            } else {
                                answerWork += '        <' + nsProp.namespace + ':' + nsProp.term+ '>' + workResp[j].o.value + '</' + nsProp.namespace + '>\n';
                            }
                        }
                        answerWork += '    </rdf:Description>\n';
                        deferred.resolve(head + namespacer.buildRDF() + answer + answerWork + tail);
                    } else {
                        deferred.resolve(head + namespacer.buildRDF() + answer + tail);
                    }
                });
            } else {
                deferred.reject();
            }
        });
        return deferred.promise;
    }
};

var Namespace = function() {
    this._tracker = 0;
    this._map = {};
    this._map['http://www.w3.org/1999/02/22-rdf-syntax-ns#'] = 'rdf';
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
    str = '<rdf:RDF'
    for (ns in this._map) {
        if (this._map.hasOwnProperty(ns)) {
            str += ' xmlns:' + this._map[ns] + '="' + ns + '"';
        }
    }
    return str + ">\n";
};
