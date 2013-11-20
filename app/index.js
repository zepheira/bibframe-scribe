var rdfstore, restify, uuid, http, url, db, server, doProxy, IDBASE, config;

rdfstore = require('rdfstore');
restify = require('restify');
uuid = require('uuid');
http = require('http');
url = require('url');

IDBASE = "http://example.org/id";

server = restify.createServer();
server.use(restify.bodyParser({ mapParams: false }));

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

db = new rdfstore.Store(config.store, function(store) {
    // Store the n3 propety of an incoming JSON object, because just
    // getting the raw body is apparently more difficult; may come in
    // handy, possibly also pass a list of IDs to save, and delete
    // existing nodes with those IDs before saving.
    server.put('/resource/new', function newResource(req, res, next) {
        store.load('text/n3', req.body.n3, function(success, graph) {
            res.send(201, {"success": success});
        });
        return next();
    });

    // Query the store for matching suggestions
    server.get('/suggest/local', function suggestLocal(req, res, next) {
        var q, parts, query, answer, i;
        parts = url.parse(req.url, true);
        q = parts.query.q;
        query = 'SELECT * { ?s ?p ?o . FILTER regex(?o, "' + q + '", "i") }';
        answer = [];
        store.execute(query, function(success, results) {
            if (success) {
                for (i = 0; i < results.length; i++) {
                    answer.push({
                        'uri': results[i].s.value,
                        'label': results[i].o.value
                    });
                }
                res.send(200, answer);
            } else {
                res.send(500, {"success": false});
            }
            return next();
        });
    });
});

server.post('/resource/id', function newIdentifier(req, res, next) {
    var num, id;
    num = uuid.v4();
    id = IDBASE + num;
    res.send(200, {"id": id});
    return next();
});

// Static file handling
server.get(/\/static\/?.*/, restify.serveStatic({
    'directory': config.staticDir,
    'default': 'index.html'
}));

doProxy = function(req, res, host, path, args) {
    // @@@ where does next() fit into using things this way?
    var proxy, request, parts;
    parts = url.parse(req.url, true);
    request = http.request({
        'hostname': host,
        'method': 'GET',
        'path': path + parts.search + args
    });
    request.addListener('response', function(proxy_response) {
        proxy_response.addListener('data', function(chunk) {
            res.write(chunk, 'binary');
        });
        proxy_response.addListener('end', function() {
            res.end();
        });
        res.writeHead(proxy_response.statusCode, proxy_response.headers);
    });
    request.end();
};

// Proxy third-party auto-suggests
server.get('/suggest/viaf', function getViaf(req, res, next) {
    // www.oclc.org/developer/documentation/virtual-international-authority-file-viaf/request-types#autosuggest
    // ask for ?query=
    doProxy(req, res, 'viaf.org', '/viaf/AutoSuggest', '');
});

server.get('/suggest/fast', function getFast(req, res, next) {
    // www.oclc.org/developer/documentation/assignfast/using-api
    // ask for ?query=
    doProxy(req, res, 'fast.oclc.org', '/searchfast/fastsuggest', '&queryIndex=suggestall&queryReturn=suggestall%2Cidroot%2Cauth%2Ctag%2Ctype%2Craw%2Cbreaker%2Cindicator&rows=10');
});

server.get('/suggest/lc', function getFast(req, res, next) {
    // (no formal documentation)
    // may use more specific URL hierarchy, e.g., /authorities/subjects/suggest
    // ask for ?q=
    doProxy(req, res, 'id.loc.gov', '/suggest/', '');
});

server.get('/suggest/agrovoc', function getFast(req, res, next) {
    // foris.fao.org/agrovoc/
    // ask for ?q=
    doProxy(req, res, 'foris.fao.org', '/agrovoc/term/find', '&hits=8&match=freeText&suggestions=20&language=EN&relationshipType[]=alternative&relationshipType[]=broader&callback=');
    // @@@ would prefer to unwrap callback
});

server.listen(config.listen, function() {
    console.log('%s listening at %s', server.name, server.url);
});
