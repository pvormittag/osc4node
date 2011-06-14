var express = require('express')
  , fs = require('fs')
  , io = require('socket.io')
  , osc = require('../lib/osc4node');

/***********************************************************/
var app = express.createServer();

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
    app.use(express.errorHandler()); 
});

app.get('/', function(req, res){
    res.render('index', {
        title: 'node4osc client demo'
    });
});

app.listen(3000, 'localhost');
console.log("----------------- Express server listening on port %d -----------------", app.address().port);


/***********************************************************/

var oscServer
  , oscClient
  , socket = io.listen(app);

// bind callbacks.
socket.on('connection', function(client){
    client.broadcast({ info: client.sessionId + ' connected' });
    
    client.on('message', function(obj) {
        
        // in this example, server receives config object from browser-client at first.
        // it contains 'port' and 'host' settings for Server and Client.
        if ('config' in obj) {
            var config = obj.config;
            oscServer = new osc.Server(config.server.port, config.server.host);
            oscClient = new osc.Client(config.client.host, config.client.port);
            
            client.send({ info: 'oscServer created: [port: ' + oscServer.port + ', host: ' + oscServer.host + ']' });
            client.send({ info: 'oscClient created: [port: ' + oscClient.port + ', host: ' + oscClient.host + ']' });
            
            var msg = new osc.Message('/status', client.sessionId + ' connected');
            oscServer.send(msg, oscClient);
            
            // oscServer dispatches 'oscmessage' event when receives the message.
            // so we attach handler on the event for global message handling.
            oscServer.on('oscmessage', function(msg, rinfo) {
                console.log(msg);
                client.send({
                    oscmessage: {
                        address: msg.address
                      , typetag: msg.typetag
                      , args: msg.arguments
                    }
                });
            });
        } else if ('oscmessage' in obj) {
            var msg = obj.oscmessage;
            
            // create Bundle
            var bundle   = new osc.Bundle()
              , msg1 = new osc.Message(msg.address, msg.message)
              , msg2 = new osc.Message('/status', 'from ' + client.sessionId + ' at ' + new Date().toString());
            
            // to bundle messages, simply call 'add()' with instance of the Message.
            bundle.add(msg1);
            bundle.add(msg2);
            
            // set timetag.
            bundle.setTimetag(bundle.now());
            
            // we can send Bundle in the same way as Message.
            if (oscServer && oscClient) oscServer.send(bundle, oscClient);
        }
    });
    
    client.on('disconnect', function(){
        client.broadcast({ disconnection: client.sessionId});
    });
});