var http = require('http'); 
io = require('socket.io');
fs = require('fs');

server = http.createServer();
server.listen(8080);

var socket = io.listen(server);

var socketCount = 0;
var clients = [];

var users = {};

var startTime;
var duration;

var game = false;

socket.of('/sock')
  .on('connection',function(client) {
    socketCount++;
    client.on('disconnect', function() {
      console.log('Client disconnect');
      --socketCount;
    });
    
    var nick;

    console.log('Client connected to Up and Running namespace.');
    client.send("Welcome to 'Up and Running'");
    setInterval(function() {client.emit('message', "tick")}, 500);
    client.on('uploadNick', function(data) {
      nick = data;
      users[nick] = 0;
      clients.push(client);
    });
    client.on('uploadShake', function(data) {
      if(!nick)
        return ;
      if(!game)
        return ;
      users[nick] += (new Date().getTime() % 1000);
      console.log(nick + ': ' + users[nick]);
      client.emit('score', users[nick]);
    });
})

socket.of('/system')
  .on('connection', function(client){
    console.log('Client connected to System namespace.');
    setInterval(function() {
      client.emit('count', socketCount);
    }, 1000);
    client.on('notifyUpdate', function(data) {
      startTime = data.startTime;
      duration = data.duration;
      console.log('data: ' + data + ', startTime:' + new Date(data.startTime));
      var delay = startTime - (new Date().getTime());
      console.log(delay);
      setTimeout(function() {
        game = true;
        console.log('started');
        for(name in users) {
          users[name] = 0;
        }
        clients.forEach(function(gameClient) {
          gameClient.emit('started', {});
        })
        setTimeout(function() {
          game = false;
          console.log('ended');
          var rank = [];
          for(name in users) {
            rank.push({name: name, score: users[name]});
          }
          rank.sort(function(a, b) {
            return b.score - a.score;
          });
          rank = rank.slice(0,3);
          console.log(rank);
          clients.forEach(function(gameClient) {
            gameClient.emit('ended', rank)
          });
        }, duration * 1000);
      }, delay);
    });
});
