var http = require('http'); 
io = require('socket.io');
fs = require('fs');

server = http.createServer();
server.listen(8080);

var socket = io.listen(server);

var socketCount = 0;

socket.of('/sock')
  .on('connection',function(client) {
    socketCount++;
    client.on('disconnect', function() {
      console.log('Client disconnect');
      --socketCount;
    });
    
    var count = 0;
    console.log('Client connected to Up and Running namespace.');
    client.send("Welcome to 'Up and Running'");
    setInterval(function() {client.emit("message", "tick")}, 500);
    client.on("count", function(data) {console.log(++count);} )
  })

socket.of('/system')
  .on('connection', function(client){
    console.log('Client connected to System namespace.');
    setInterval(function() {
      client.emit("count", socketCount);
    }, 1000);
});

