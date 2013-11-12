var rdfstore, restify, db, server;

rdfstore = require('rdfstore');
restify = require('restify');

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
});

server.get(/\/static\/?.*/, restify.serveStatic({
    'directory': './static',
    'default': 'index.html'
}));

server.listen(8888, function() {
    console.log('%s listening at %s', server.name, server.url);
});
