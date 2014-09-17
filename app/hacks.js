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

var domainWork = '<http://bibframe.org/vocab/titleStatement>,' + 
    '<http://bibframe.org/vocab/workTitleRemained>,' + 
    '<http://bibframe.org/vocab/proposed/author>,' + 
    '<http://bibframe.org/vocab/proposed/editor>,' + 
    '<http://bibframe.org/vocab/proposed/contributor>,' + 
    '<http://bibframe.org/vocab/proposed/translator>,' + 
    '<http://bibframe.org/vocab/proposed/illustrator>,' + 
    '<http://bibframe.org/vocab/contentCategory>,' + 
    '<http://bibframe.org/vocab/contentsNote>,' + 
    '<http://bibframe.org/vocab/language>,' + 
    '<http://bibframe.org/vocab/notes>,' + 
    '<http://bibframe.org/vocab/subject>,' + 
    '<http://bibframe.org/vocab/otherEdition>,' + 
    '<http://bibframe.org/vocab/isEditionOf>,' + 
    '<http://bibframe.org/vocab/isTranslationOf>,' + 
    '<http://bibframe.org/vocab/hasTranslation>,' + 
    '<http://bibframe.org/vocab/isVersionOf>,' + 
    '<http://bibframe.org/vocab/hasVersion>,' + 
    '<http://bibframe.org/vocab/isVariantOf>,' + 
    '<http://bibframe.org/vocab/hasVariant>,' + 
    '<http://bibframe.org/vocab/isBasedOn>,' + 
    '<http://bibframe.org/vocab/isBasisFor>,' +
    '<http://bibframe.org/vocab/classificationDdc>,' +
    '<http://bibframe.org/vocab/classificationLcc>,' +
    '<http://bibframe.org/vocab/classificationNlm>,' +
    '<http://bibframe.org/vocab/classificationUdc>,' + 
    '<http://bibframe.org/vocab/workTitle>,' + 
    '<http://bibframe.org/vocab/rel/artist>,' + 
    '<http://bibframe.org/vocab/description>,' + 
    '<http://bibframe.org/vocab/rel/recordingArtist>,' + 
    '<http://bibframe.org/vocab/av/track>';

var domainInstance = '<http://bibframe.org/vocab/ISBN10>,' + 
    '<http://bibframe.org/vocab/ISBN13>,' + 
    '<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>,' +
    '<http://bibframe.org/vocab/isInstanceOf>,' + 
    '<http://bibframe.org/vocab/provider>,' + 
    '<http://bibframe.org/vocab/publisher>,' + 
    '<http://bibframe.org/vocab/manufacturer>,' + 
    '<http://bibframe.org/vocab/producer>,' + 
    '<http://bibframe.org/vocab/distributor>,' + 
    '<http://bibframe.org/vocab/carrierCategory>,' + 
    '<http://bibframe.org/vocab/mediaCategory>,' + 
    '<http://bibframe.org/vocab/edition>,' + 
    '<http://bibframe.org/vocab/editionResponsibility>,' + 
    '<http://bibframe.org/vocab/lccn>,' + 
    '<http://bibframe.org/vocab/link>,' + 
    '<http://bibframe.org/vocab/dimensions>,' + 
    '<http://bibframe.org/vocab/image>,' + 
    '<http://bibframe.org/vocab/duration>,' + 
    '<http://bibframe.org/vocab/extent>';

module.exports = {
    split: function(id, store) {
        var queryInstance, queryWork, deferred, answer, namespacer, head, tail, subs, subquery, queue;
        deferred = Q.defer();

        queryInstance = 'SELECT * { <' + id + '> ?p ?o . FILTER(?p IN(' + domainInstance + ')) . }';
        queryWork = 'SELECT * { <' + id + '> ?p ?o . FILTER(?p IN(' + domainWork + ')) . }';

        namespacer = new Namespace();
        head = '<?xml version="1.0"?>\n\n';
        tail = '</rdf:RDF>\n';
        answer = '';
        subs = [];
        queue = [];

        queryResource(store, queryInstance).then(function(results) {
            var i, prop, type;
            answer += '    <rdf:Description rdf:about="' + id + '">\n';
            for (i = 0; i < results.length; i++) {
                prop = namespacer.extractNamespace(results[i].p.value);
                if (prop.term === "type") {
                    type = results[i].o.value;
                }
                if (results[i].o.token === "uri") {
                    answer += '        <' + prop.namespace + ':' + prop.term + ' rdf:resource="' + results[i].o.value + '"/>\n';
                } else {
                    answer += '        <' + prop.namespace + ':' + prop.term + '>' + results[i].o.value + '</' + prop.namespace + ':' + prop.term + '>\n';
                }
            }
            answer += '    </rdf:Description>\n';

            queryResource(store, queryWork).then(function(wresults) {
                var j, k, l, wid, wprop;
                wid = "http://example.org/work" + id.split(/\/id/)[1].substr(0, 8);
                answer += '\n    <rdf:Description rdf:about="' + wid + '">\n';
                if (typeof instanceWork[type] !== "undefined") {
                    answer += '        <rdf:type rdf:resource="' + instanceWork[type] + '"/>\n';
                }
                wprop = namespacer.extractNamespace("http://bibframe.org/vocab/hasInstance");
                answer += '        <' + wprop.namespace + ':' + wprop.term + ' rdf:resource="' + id + '"/>\n';
                for (j = 0; j < wresults.length; j++) {
                    wprop = namespacer.extractNamespace(wresults[j].p.value);
                    if (wresults[j].o.token === "uri") {
                        answer += '        <' + wprop.namespace + ':' + wprop.term + ' rdf:resource="' + wresults[j].o.value + '"/>\n';
                        subs.push(wresults[j].o.value);
                    } else {
                        answer += '        <' + wprop.namespace + ':' + wprop.term + '>' + wresults[j].o.value + '</' + wprop.namespace + ':' + wprop.term + '>\n';
                    }
                }
                answer += '    </rdf:Description>\n';

                if (subs.length > 0) {
                    for (k = 0; k < subs.length; k++) {
                        subquery = "SELECT * { ?s ?p ?o . FILTER(?s IN(<" + subs[k] + ">)) . }";
                        queue.push(queryResource(store, subquery));
                    }
                    Q.allSettled(queue).then(function(subResults) {
                        subResults.forEach(function(sresults) {
                            var l, sprop;
                            if (sresults.value.length > 0) {
                                sresults = sresults.value;
                                answer += '\n    <rdf:Description rdf:about="' + sresults[0].s.value + '">\n';
                                for (l = 0; l < sresults.length; l++) {
                                    sprop = namespacer.extractNamespace(sresults[l].p.value);
                                    if (sresults[l].o.token === "uri") {
                                        answer += '        <' + sprop.namespace + ':' + sprop.term + ' rdf:resource="' + sresults[l].o.value + '"/>\n';
                                    } else {
                                        answer += '        <' + sprop.namespace + ':' + sprop.term + '>' + sresults[l].o.value + '</' + sprop.namespace + ':' + sprop.term + '>\n';
                                    }
                                }
                                answer += '    </rdf:Description>\n';
                            }
                        });
                        deferred.resolve(head + namespacer.buildRDF() + answer + tail);
                    });
                } else {
                    deferred.resolve(head + namespacer.buildRDF() + answer + tail);
                }
            });
        });
        
        return deferred.promise;
    }
};

var queryResource = function(store, query) {
    var query, deferred, i;
    deferred = Q.defer();
    store.execute(query, function(success, result) {
        if (success) {
            deferred.resolve(result);
        } else {
            deferred.reject();
        }
    });
    return deferred.promise;
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
