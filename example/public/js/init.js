$(function() {
    // create the socket to the local OSC server
    var socket = new io.Socket("localhost", { port: 3000, rememberTransport: false });
    
    // bind callbacks for each events.
    socket.on('connect', function() {
        notify('System Connected');
    });
    
    socket.on('message', function(obj) {
        if ('oscmessage' in obj) {
            var msg = obj.oscmessage;
            notify('Incoming message: ' + "\n" +
                   'address: '+ msg.address + "\n" +
                   'args: ' + msg.args);
            
            switch (msg.address) {
                case '/lp/matrix':
                    $('#c' + msg.args[0].value + msg.args[1].value)
                        .attr('checked', msg.args[2].value == 0 ? false : true);
                    console.log($('#c' + msg.args[0].value + msg.args[1].value).attr('checked'));
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
    $('.slider').change(function(e) {
        var addr = $(this).siblings().children('.addr').val()
          , val  = $(this).val();
        $(this).siblings().children('.numbox').val(val);
        $(this).siblings().children('.output').val(addr + ' ' + val);
        
        if (socket.connected) {
            socket.send({
                oscmessage: {
                    address: addr,
                    message: parseInt(val)
                }
            });
        }
    });
    $('#matrix-demo input').change(function(e) {
        var addr = $(this).parent().siblings().children('.addr').val()
          , checked = e.target.checked == true ? 1 : 0
          , id = $(this).attr('id')
          , val = id[0] + ' ' + id[1] + ' ' + checked;
        console.log(val);
        $(this).css('backgroundColor', checked ? '#dbb646' : '#fff');
        $(this).parent().siblings().children('.numbox').val(val);
        $(this).parent().siblings().children('.output').val(addr + ' ' + val);
        
        if (socket.connected) {
            socket.send({
                oscmessage: {
                    address: addr,
                    message: [parseInt(id[0]), parseInt(id[1]), checked]
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

