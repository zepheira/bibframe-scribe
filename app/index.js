var rdfstore, restify, uuid, db, server;

rdfstore = require('rdfstore');
restify = require('restify');
uuid = require('uuid');

server = restify.createServer();

db = new rdfstore.Store({
    'persistent': true,
    'engine': 'mongodb',
    'name': 'bfstore',
    'overwrite': false,
    'mongoDomain': 'localhost',
    'mongoPort': 27017
}, function(store) {
    store.graph(function(success, graph) {

    });
    store.node('http://www.example.org/people#fred', function(success, graph) {

    });
    
    server.put('/resource/new', function newResource(req, res, next) {
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

server.listen(8888, function() {
    console.log('%s listening at %s', server.name, server.url);
});
