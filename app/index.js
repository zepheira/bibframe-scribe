var rdfstore, restify, uuid, http, url, db, server;

rdfstore = require('rdfstore');
restify = require('restify');
uuid = require('uuid');
http = require('http');
url = require('url');

server = restify.createServer();
server.use(restify.bodyParser({ mapParams: false }));

db = new rdfstore.Store({
    'persistent': true,
    'engine': 'mongodb',
    'name': 'bfstore',
    'overwrite': false,
    'mongoDomain': 'localhost',
    'mongoPort': 27017
}, function(store) {
    server.put('/resource/new', function newResource(req, res, next) {
        store.load('text/n3', req.body.n3, function(success, graph) {
            res.send(201, {"success": success});
        });
        return next();
    });
});

server.post('/resource/id', function newIdentifier(req, res, next) {
    var num, id;
    num = uuid.v4();
    id = "http://example.org/id" + num;
    res.send(200, {"id": id});
    return next();
});

// Static file handling
server.get(/\/static\/?.*/, restify.serveStatic({
    'directory': './static',
    'default': 'index.html'
}));

// Proxy third-party auto-suggests
server.get('/suggest/viaf', function getViaf(req, res, next) {
    // ask for ?query=
    var proxy, request, parts;
    parts = url.parse(req.url, true);
    request = http.request({
        'hostname': 'viaf.org',
        'method': 'GET',
        'path': '/viaf/AutoSuggest' + parts.search
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
});

server.get('/suggest/fast', function getFast(req, res, next) {
    // ask for ?query=
    var proxy, request, parts;
    parts = url.parse(req.url, true);
    request = http.request({
        'hostname': 'fast.oclc.org',
        'method': 'GET',
        'path': '/searchfast/fastsuggest' + parts.search + '&queryIndex=suggestall&queryReturn=suggestall%2Cidroot%2Cauth%2Ctag%2Ctype%2Craw%2Cbreaker%2Cindicator&rows=10'
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
});

server.get('/suggest/lc', function getFast(req, res, next) {
    // ask for ?q=
    var proxy, request, parts;
    parts = url.parse(req.url, true);
    request = http.request({
        'hostname': 'id.loc.gov',
        'method': 'GET',
        'path': '/suggest/' + parts.search
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
});

server.listen(8888, function() {
    console.log('%s listening at %s', server.name, server.url);
});
