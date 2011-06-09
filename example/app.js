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
console.log("Express server listening on port %d", app.address().port);


/***********************************************************/

// OscServer and OscClient is just defined here.
// create the socket for communicating to the browser.
var OscServer
  , OscClient
  , socket = io.listen(app);

// bind callbacks.
socket.on('connection', function(client){
    client.broadcast({ info: client.sessionId + ' connected' });
    
    client.on('message', function(obj) {
        // in this example, first browser-client sends a configuration object.
        // it contains 'port' and 'host' settings for Server and Client.
        if ('config' in obj) {
            var config = obj.config;
            OscServer = new osc.Server(config.server.port, config.server.host);
            OscClient = new osc.Client(config.client.host, config.client.port);
            client.send({ info: 'OscServer created: [port: ' + OscServer.port + ', host: ' + OscServer.host + ']' });
            client.send({ info: 'OscClient created: [port: ' + OscClient.port + ', host: ' + OscClient.host + ']' });
            
            var message = new osc.Message('/status', client.sessionId + ' connected');
            OscServer.send(message, OscClient);
            
            // OscServer dispatches 'oscmessage' event when receives the message.
            // so we attach handler on the event for global message handling.
            OscServer.on('oscmessage', function(msg) {
                // check message address pattern.
                if (msg.checkAddrPattern('/lp/matrix')) {
                    // and check message typetag.
                    if (msg.checkTypetag('iii')) {
                        client.send({
                            oscmessage: {
                                address: msg.address,
                                typetags: msg.typetags,
                                args: msg.args
                            }
                        });
                    }
                }
            });
        } else if ('oscmessage' in obj) {
            console.log(obj.oscmessage);
            var msg = obj.oscmessage;
            // Bundle is now available.
            var bundle   = new osc.Bundle(),
                message1 = new osc.Message(msg.address, msg.message),
                message2 = new osc.Message('/status', 'from ' + client.sessionId + ' at ' + new Date().toString());
            
            // to bundle messages, simply call 'add()' with instance of the Message.
            bundle.add(message1);
            bundle.add(message2);
            // set timetag.
            bundle.setTimetag(bundle.now());
            
            // we can send Bundle in the same way as Message.
            OscServer.send(bundle, OscClient);
        }
    });
    
    client.on('disconnect', function(){
        client.broadcast({ disconnection: client.sessionId});
    });
});