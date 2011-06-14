$(function() {
    // create the socket for the local OSC server
    var socket = new io.Socket("localhost", { port: 3000, rememberTransport: false });
    
    // bind callbacks for each events.
    socket.on('connect', function() {
        notify('System Connected');
    });
    
    socket.on('message', function(obj) {
        if ('oscmessage' in obj) {
            var msg = obj.oscmessage
              , addr = msg.address
              , args = msg.args
              , paprent;
            
            if (addr.match(/slider/i)) {
                var slider = addr[addr.length - 1] == 'i'
                        ? $('#receive .slider.int')
                        : $('#receive .slider.float');
                slider.val(args[0].value);
                
                paprent = slider.parent();
                paprent.find('.addr').val(addr);
                paprent.find('.numbox').val(args[0].value);
                paprent.find('.output').val(addr + ' ' + args[0].value);
            } else if (addr.match(/matrix/i)) {
                var mat = $('#r' + args[0].value + args[1].value);
                mat.attr('checked', args[2].value == 0 ? false : true);
                
                paprent = mat.parent().parent();
                paprent.find('.addr').val(addr);
                paprent.find('.numbox').val(args[0].value);
                paprent.find('.output').val(addr + ' ' + args[0].value + ' ' + args[1].value + ' ' + args[2].value);
            }
            switch (msg.address) {
                case '/max/matrix':
                    $('#r' + msg.args[0].value + msg.args[1].value)
                        .attr('checked', msg.args[2].value == 0 ? false : true);
                    break;
                default:
                    break;
            }
        } else if ('info' in obj) {
            notify(obj.info);
        }
    });
    socket.on('disconnect', function() {
        notify('System Disconnected');
    });
    socket.on('reconnect', function() {
        notify('System Reconnected to server');
    });
    socket.on('reconnecting', function(nextRetry){
        notify('System Attempting to re-connect to the server, next attempt in ' + nextRetry + 'ms');
    });
    socket.on('reconnect_failed', function() {
        notify('System Reconnected to server FAILED.');
    });
    
    socket.connect();
    
    console.log(socket);
    $('#submit').click(function() {
        if (socket.connected) {
            socket.send({
                config: {
                    server: { port: parseInt($('.server .port').val()), host: 'localhost' },
                    client: { port: parseInt($('.client .port').val()), host: 'localhost' }
                }
            });
        }
    });
    $('#send .slider').change(function(e) {
        var self = $(this)
          , addr = self.siblings().children('.addr').val()
          , val  = self.val();
        self.siblings().children('.numbox').val(val);
        self.siblings().children('.output').val(addr + ' ' + val);
        
        if (socket.connected) {
            val = Math.floor(Number(val)) == val ? parseInt(val) : parseFloat(val);
            socket.send({
                oscmessage: {
                    address: addr,
                    message: val
                }
            });
        }
    });
    $('#send').find('.matrix-demo input').change(function(e) {
        var self = $(this)
          , addr = self.parent().siblings().children('.addr').val()
          , checked = e.target.checked == true ? 1 : 0
          , id = self.attr('id')
          , val = id[1] + ' ' + id[2] + ' ' + checked;
        console.log(val);
        //self.css('backgroundColor', checked ? '#dbb646' : '#fff');
        self.parent().siblings().children('.numbox').val(val);
        self.parent().siblings().children('.output').val(addr + ' ' + val);
        
        if (socket.connected) {
            socket.send({
                oscmessage: {
                    address: addr,
                    message: [parseInt(id[1]), parseInt(id[2]), checked]
                }
            });
        }
    });
    
    function notify(msg) {
        $('<div></div>')
            .addClass('notification')
            .text(msg)
            .appendTo('#info')
            .fadeIn(1000)
            .delay(2000)
            .fadeOut(500);
    }
});

