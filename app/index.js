var rdfstore, restify, uuid, http, url, Q, db, server, doProxy, proxyHelper, config, tr, serviceConfig, localSuggestHelper, IDBASE;

rdfstore = require('rdfstore');
restify = require('restify');
uuid = require('uuid');
http = require('http');
url = require('url');
Q = require('q');
tr = require('./translate');

IDBASE = 'http://example.org/id';

server = restify.createServer();
server.use(restify.bodyParser({ mapParams: false }));

/**
 * To configure using a separate file, create config.js in this
 * directory.  See below for what attributes module.exports can take.
 */
try {
    config = require('./config');
} catch (ex) {
    config = {
        'store': {
            'persistent': true,
            'engine': 'mongodb',
            'name': 'bfstore',
            'overwrite': false,
            'mongoDomain': 'localhost',
            'mongoPort': 27017
        },
        'listen': 8888,
        'staticDir': './static'
    }
}

serviceConfig = {
    "agrovoc": {
    },
    "fast": {
    },
    "lc": {
        "subjects": {
            "branch": "/authorities/subjects"
        },
        "geo": {
            "branch": "/vocabulary/geographicAreas"
        },
        "names": {
            "branch": "/authorities/names"
        },
        "lang": {
            "branch": "/vocabulary/iso639-2"
        },
        "works": {
            "branch": "/authorities/names"
        }
    },
    "local": {
        "works": {
            "types": [
                "http://bibframe.org/vocab/Work",
                "http://bibframe.org/vocab/Book",
                "http://bibframe.org/vocab/proposed/EBook",
                "http://bibframe.org/vocab/proposed/PhysicalBook",
                "http://bibframe.org/vocab/Article",
                "http://bibframe.org/vocab/proposed/EArticle",
                "http://bibframe.org/vocab/proposed/PhysicalArticle",
                "http://bibframe.org/vocab/Painting"
            ]
        },
        "agents": {
            "types": [
                "http://bibframe.org/vocab/Family",
                "http://bibframe.org/vocab/Jurisdiction",
                "http://bibframe.org/vocab/Meeting",
                "http://bibframe.org/vocab/Organization",
                "http://bibframe.org/vocab/Person",
                "http://bibframe.org/vocab/rda/Agent"
            ]
        },
        "lang": {
            "types": [
                "http://bibframe.org/vocab/LanguageEntity"
            ]
        },
        "providers": {
            "types": [
                "http://bibframe.org/vocab/PublisherEvent",
                "http://bibframe.org/vocab/ManufactureEvent",
                "http://bibframe.org/vocab/ProducerEvent",
                "http://bibframe.org/vocab/DistributeEvent"
            ]
        },
        "geo": {
            "types": [
                "http://bibframe.org/vocab/rda/Place",
                "http://bibframe.org/vocab/Place"
            ]
        },
        "subjects": {
            "types": [
                "http://bibframe.org/vocab/Topic",
                "http://bibframe.org/vocab/TemporalConcept",
                "http://bibframe.org/vocab/ClassificationEntity",
                "http://bibframe.org/vocab/rda/Authority",
                "http://bibframe.org/vocab/rda/Period",
                "http://bibframe.org/vocab/rda/Technique",
                "http://bibframe.org/vocab/rda/WorkType"
            ]
        }
    },
    "viaf": {
    }
};

db = new rdfstore.Store(config.store, function(store) {
    // Store the n3 propety of an incoming JSON object, because just
    // getting the raw body is apparently more difficult; may come in
    // handy, possibly also pass a list of IDs to save, and delete
    // existing nodes with those IDs before saving.
    server.put('/resource/new', function newResource(req, res, next) {
        store.load('text/n3', req.body.n3, function(success, graph) {
            res.send(201, {'success': success});
        });
        return next();
    });

    localSuggestHelper = function(qin, types) {
        var i, query, qtypes, deferred, answer;
        answer = [];
        deferred = Q.defer();
        query = 'SELECT * { ?s ?p ?o . FILTER regex(?o, "' + qin + '", "i") . FILTER(?p IN (<http://bibframe.org/vocab/title>,<http://bibframe.org/vocab/label>)) ';
        if (typeof types !== "undefined" && types !== null && types.length > 0) {
            qtypes = [];
            for (i = 0; i < types.length; i++) {
                qtypes.push('<' + types[i] + '>');
            }
            query += ' . ?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?v . FILTER(?v IN (' + qtypes.join(", ") + ')) . }';
        } else {
            query += ' }';
        }
        store.execute(query, function(success, results) {
            if (success) {
                for (i = 0; i < results.length; i++) {
                    answer.push({
                        'uri': results[i].s.value,
                        'label': results[i].o.value,
                        'source': 'local'
                    });
                }
                deferred.resolve(answer);
            } else {
                deferred.reject();
            }
        });
        return deferred.promise;
    };

    // Query the store for matching suggestions
    server.get('/suggest/local', function suggestLocal(req, res, next) {
        var qin, parts, query, i;
        parts = url.parse(req.url, true);
        qin = parts.query.q;
        localSuggestHelper(qin, null, answer).then(
            function(data) {
                res.send(200, data);
            },
            function(err) {
                res.send(500, {"success": false});
            }
        ).fin(function() {
            next();
        });
    });

    // Aggregate queries to different services
    server.get('/suggest/master', function suggestMaster(req, res, next) {
        var i, query, services, s, conf, sub, answer;
        answer = [];
        parts = url.parse(req.url, true);
        services = JSON.parse(parts.query.services);
        query = parts.query.q;
        for (i  = 0; i < services.length; i++) {
            s = services[i];
            if (s.indexOf(":") > 0) {
                conf = s.substr(0, s.indexOf(":"));
                sub = serviceConfig[conf][s.substr(s.indexOf(":") + 1)];
            } else {
                // not really doing anything useful with this info if no sub
                conf = serviceConfig[s];
                sub = null;
            }
            if (conf === "local") {
                localSuggestHelper(query, (sub !== null) ? sub.types : null).then(
                    function(data) {
                        answer = answer.concat(data);
                    }
                ).fin(function() {
                    res.send(200, answer);
                    next();
                });
            } else {
                // answer = answer.concat();
            }
        }
    });
});

server.post('/resource/id', function newIdentifier(req, res, next) {
    var num, id;
    num = uuid.v4();
    id = IDBASE + num;
    res.send(200, {'id': id});
    return next();
});

// Static file handling
server.get(/\/static\/?.*/, restify.serveStatic({
    'directory': config.staticDir,
    'default': 'index.html'
}));

proxyHelper = function(qin, branch, answer) {
    var flag;
    //@@@
    return flag;
};

doProxy = function(req, res, host, path, args, queryParam, source, next) {
    var proxy, request, parts, answer;
    parts = url.parse(req.url, true);
    if (typeof parts.query.branch !== 'undefined' && parts.query.branch !== '') {
        path = decodeURIComponent(parts.query.branch) + path;
    }
    request = http.request({
        'hostname': host,
        'method': 'GET',
        'path': path + '?' + queryParam + '=' + parts.query.q + args
    });
    answer = '';
    request.addListener('response', function(proxy_response) {
        proxy_response.addListener('data', function(chunk) {
            answer += chunk;
        });
        proxy_response.addListener('end', function() {
            res.end(tr[source](answer));
            next();
        });
        res.writeHead(proxy_response.statusCode, {"Content-Type": "application/json"});
    });
    request.end();
};

// Proxy third-party auto-suggests
server.get('/suggest/viaf', function getViaf(req, res, next) {
    // www.oclc.org/developer/documentation/virtual-international-authority-file-viaf/request-types#autosuggest
    doProxy(req, res, 'viaf.org', '/viaf/AutoSuggest', '', 'query', 'viaf', next);
});

server.get('/suggest/fast', function getFast(req, res, next) {
    // www.oclc.org/developer/documentation/assignfast/using-api
    doProxy(req, res, 'fast.oclc.org', '/searchfast/fastsuggest', '&queryIndex=suggestall&queryReturn=suggestall%2Cidroot%2Cauth%2Ctag%2Ctype%2Craw%2Cbreaker%2Cindicator&rows=10', 'query', 'fast', next);
});

server.get('/suggest/lc', function getFast(req, res, next) {
    // (no formal documentation)
    // may use more specific URL hierarchy, e.g., /authorities/subjects/suggest
    doProxy(req, res, 'id.loc.gov', '/suggest/', '', 'q', 'lc', next);
});

server.get('/suggest/agrovoc', function getFast(req, res, next) {
    // foris.fao.org/agrovoc/
    doProxy(req, res, 'foris.fao.org', '/agrovoc/term/find', '&hits=8&match=freeText&suggestions=20&language=EN&relationshipType[]=alternative&relationshipType[]=broader&callback=', 'q', 'agrovoc', next);
});

server.listen(config.listen, function() {
    console.log('%s listening at %s', server.name, server.url);
});
