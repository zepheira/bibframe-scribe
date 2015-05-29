var levelgraph, levelgraphN3, restify, uuid, http, url, Q, db, server, doProxy, proxyHelper, config, tr, serviceConfig, localSuggestHelper, IDBASE;

levelup = require ('level');
levelgraph = require('levelgraph');
levelgraphN3 = require('levelgraph-n3');
N3 = require('n3');
restify = require('restify');
uuid = require('uuid');
url = require('url');
Q = require('q');
http = require('q-io/http');
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
            'path': './bfstore'
        },
        'listen': 8888,
        'staticDir': '.'
    }
}

serviceConfig = {
    'agrovoc': {
        'config': {
            'host': 'foris.fao.org',
            'path': '/agrovoc/term/find',
            'queryArgs': '&hits=8&match=freeText&suggestions=20&language=EN&relationshipType[]=alternative&relationshipType[]=broader&callback=',
            'arg': 'q'
        }
    },
    'fast': {
        'config': {
            'host': 'fast.oclc.org',
            'path': '/searchfast/fastsuggest',
            'queryArgs': '&queryIndex=suggestall&queryReturn=suggestall%2Cidroot%2Cauth%2Ctag%2Ctype%2Craw%2Cbreaker%2Cindicator&rows=10',
            'arg': 'query'
        }
    },
    'viaf': {
        'config': {
            'host': 'viaf.org',
            'path': '/viaf/AutoSuggest',
            'queryArgs': '',
            'arg': 'query'
        }
    },
    'lc': {
        'config': {
            'host': 'id.loc.gov',
            'path': '/suggest/',
            'queryArgs': '',
            'arg': 'q'
        },
        'subjects': {
            'branch': '/authorities/subjects'
        },
        'geo': {
            'branch': '/vocabulary/geographicAreas'
        },
        'names': {
            'branch': '/authorities/names'
        },
        'lang': {
            'branch': '/vocabulary/iso639-2'
        },
        'works': {
            'branch': '/authorities/names'
        },
        'mediaTypes': {
            'branch': '/vocabulary/mediaTypes'
        },
        'contentTypes': {
            'branch': '/vocabulary/contentTypes'
        },
        'carrier': {
            'branch': '/vocabulary/carriers'
        }
    },
    'local': {
        'works': {
            'types': [
                'http://bibframe.org/vocab/Work',
                'http://bibframe.org/vocab/Book',
                'http://bibframe.org/vocab/proposed/EBook',
                'http://bibframe.org/vocab/proposed/PhysicalBook',
                'http://bibframe.org/vocab/Article',
                'http://bibframe.org/vocab/proposed/EArticle',
                'http://bibframe.org/vocab/proposed/PhysicalArticle',
                'http://bibframe.org/vocab/Painting'
            ]
        },
        'agents': {
            'types': [
                'http://bibframe.org/vocab/Family',
                'http://bibframe.org/vocab/Jurisdiction',
                'http://bibframe.org/vocab/Meeting',
                'http://bibframe.org/vocab/Organization',
                'http://bibframe.org/vocab/Person',
                'http://bibframe.org/vocab/rda/Agent'
            ]
        },
        'lang': {
            'types': [
                'http://bibframe.org/vocab/LanguageEntity'
            ]
        },
        'providers': {
            'types': [
                'http://bibframe.org/vocab/PublisherEvent',
                'http://bibframe.org/vocab/ManufactureEvent',
                'http://bibframe.org/vocab/ProducerEvent',
                'http://bibframe.org/vocab/DistributeEvent'
            ]
        },
        'geo': {
            'types': [
                'http://bibframe.org/vocab/rda/Place',
                'http://bibframe.org/vocab/Place'
            ]
        },
        'subjects': {
            'types': [
                'http://bibframe.org/vocab/Topic',
                'http://bibframe.org/vocab/TemporalConcept',
                'http://bibframe.org/vocab/ClassificationEntity',
                'http://bibframe.org/vocab/rda/Authority',
                'http://bibframe.org/vocab/rda/Period',
                'http://bibframe.org/vocab/rda/Technique',
                'http://bibframe.org/vocab/rda/WorkType'
            ]
        }
    }
};

db = levelgraphN3(levelgraph(
    levelup(config.store.path, {
        createIfMissing: true,
        errorIfExists: false,
        compression: true
    }),
    { joinAlgorithm: "basic" }
));

// Store the n3 propety of an incoming JSON object, because just
// getting the raw body is apparently more difficult; may come in
// handy, possibly also pass a list of IDs to save, and delete
// existing nodes with those IDs before saving.
server.put('/resource/new', function newResource(req, res, next) {
    db.n3.put(req.body.n3, function putResult(err) {
        var success = (typeof err === "undefined" || err === null) ? true : false;
        res.send(201, {'success': success});
    });
    return next();
});

localSuggestHelper = function(qin, types) {
    var i, query, deferred, answer;
    answer = [];
    deferred = Q.defer();

    query = [{
        subject: db.v("s"),
        predicate: db.v("p"),
        object: db.v("o"),
        filter: function predFilter(triple) {
            return triple.predicate === "http://bibframe.org/vocab/title" || triple.predicate === "http://bibframe.org/vocab/label";
        }
    }];

    if (typeof types !== 'undefined' && types !== null && types.length > 0) {
        query.push({
            subject: db.v("s"),
            predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            filter: function typeFilter(triple) {
                return types.indexOf(triple.object) > -1;
            }
        });
    }

    db.search(query, {
        filter: function searchFilter(solution, callback) {
            var re = new RegExp("^" + qin, "i");
            if (re.test(N3.Util.getLiteralValue(solution.o))) {
                callback(null, solution);
            } else {
                callback();
            }
        }
    }, function processResults(err, results) {
        if (typeof err === "undefined" || err === null) {
            for (i = 0; i < results.length; i++) {
                answer.push({
                    'uri': results[i].s,
                    'label': N3.Util.getLiteralValue(results[i].o),
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
    localSuggestHelper(qin, null).then(
        function(data) {
            res.send(200, data);
        },
        function(err) {
            res.send(500, {'success': false});
        }
    ).fin(function() {
        next();
    });
});

// Aggregate queries to different services
server.get('/suggest/master', function suggestMaster(req, res, next) {
    var i, query, services, s, conf, sub, answer, queue;
    answer = [];
    queue = [];
    parts = url.parse(req.url, true);
    services = JSON.parse(parts.query.services);
    query = parts.query.q;
    for (i  = 0; i < services.length; i++) {
        s = services[i];
        if (s.indexOf(':') > 0) {
            conf = s.substr(0, s.indexOf(':'));
            sub = serviceConfig[conf][s.substr(s.indexOf(':') + 1)];
        } else {
            conf = s;
            sub = null;
        }
        if (conf === 'local') {
            queue.push(localSuggestHelper(query, (sub !== null) ? sub.types : null));
        } else {
            queue.push(proxyHelper(query, serviceConfig[conf].config, conf, (sub !== null) ? sub.branch : null));
        }
    }

    Q.allSettled(queue).then(function(results) {
        results.forEach(function(result) {
            if (result.state === 'fulfilled') {
                answer = answer.concat(result.value);
            }
        });
        res.send(200, answer);
    });
});

// what follows is unrelated to the DB

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

proxyHelper = function(qin, conf, source, branch) {
    var request, a;
    request = http.request('http://' + conf.host + ((branch !== null) ? branch : '') + conf.path +  '?' + conf.arg + '=' + qin + conf.queryArgs);
    return request.then(function(response) {
        return response.body.read().then(function(answer) {
            return tr[source](answer);
        });
    });
};

doProxy = function(req, res, conf, source, branch, next) {
    var parts, answer;
    parts = url.parse(req.url, true);
    proxyHelper(parts.query.q, conf, source, branch).then(
        function(data) {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(data));
        }
    );
};

// Proxy external auto-suggests
server.get('/suggest/viaf', function getViaf(req, res, next) {
    // www.oclc.org/developer/documentation/virtual-international-authority-file-viaf/request-types#autosuggest
    doProxy(req, res, serviceConfig['viaf'].config, 'viaf', null, next);
});

server.get('/suggest/fast', function getFast(req, res, next) {
    // www.oclc.org/developer/documentation/assignfast/using-api
    doProxy(req, res, serviceConfig['fast'].config, 'fast', null, next);
});

server.get('/suggest/lc', function getFast(req, res, next) {
    // (no formal documentation)
    // may use more specific URL hierarchy, e.g., /authorities/subjects/suggest
    doProxy(req, res, serviceConfig['lc'].config, 'lc', null, next);
});

server.get('/suggest/agrovoc', function getFast(req, res, next) {
    // foris.fao.org/agrovoc/
    doProxy(req, res, serviceConfig['agrovoc'].config, 'agrovoc', null, next);
});

server.listen(config.listen, function() {
    console.log('%s listening at %s', server.name, server.url);
});
