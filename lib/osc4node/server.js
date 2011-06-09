/****************************************************
 *
 * OSC Server
 *
 ****************************************************/

var Client = require('./client');

var dgram  = require('dgram')
  , events = require('events')
  , util   = require('util');

var Server = module.exports = function(port, host) {
    events.EventEmitter.call(this);
    
    this._port = port;
    this._host = host;
    this._sock = dgram.createSocket('udp4');
};

util.inherits(Server, events.EventEmitter);

Server.prototype.__defineGetter__('host', function() {
    return this._host;
});
Server.prototype.__defineSetter__('host', function(value) {
    try {
        this.dispose();
        this._host = value;
        this.connect();
    } catch(e) {
        throw new Error(e.message);
    }
});

Server.prototype.__defineGetter__('port', function() {
    return this._port;
});
Server.prototype.__defineSetter__('port', function(value) {
    try {
        this.dispose();
        this._port = value;
        this.connect();
    } catch(e) {
        throw new Error(e.message);
    }
});

Server.prototype.connect = function() {
    this._sock.bind(this._port, this._host);
    
    var server = this,
        _callbacks = [];
    
    this._sock.on('message', function (msg, rinfo) {
        // decoded message is now chenged into Message.
        var decoded = decode(msg);
        try {
            if (decoded) {
                server.emit('oscmessage', decoded, rinfo);
            }
        }
        catch (e) {
            console.log("can't decode incoming message: " + e.message);
        }
    });
};

Server.prototype.dispose = function() {
    this._sock.close();
};

Server.prototype.send = function (msg, client) {
    if (!client || !client instanceof Client) {
        throw new Error('Server::send - invalid client');
    }
    
    var binary;
    if (msg.getBinary && typeof msg.getBinary === 'function') {
        binary = msg.getBinary();
    } else {
        var message = {};
        Message.apply(message, arguments)
        binary = Message.prototype.getBinary.call(message);
    }
    var buf = new Buffer(binary, 'binary');
    this._sock.send(buf, 0, buf.length, client.port, client.host);
};