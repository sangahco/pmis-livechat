const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const Store = require('data-store');
const randomID = require('random-id');
const dataStore = new Store('dataStore', { path: 'data.json' });
dataStore.clear();

var serverPort = 3000;
var serverHost = '0.0.0.0';
var serverName = 'PMIS'

process.argv.forEach(function (val, index, array) {
    console.log(index + ': ' + val);
    if (index == 2) {
        serverPort = val;
    }
    if (index == 3) {
        serverHost = val;
    }
});

app.use('/libs', express.static( __dirname + '/libs'));
app.use('/', express.static( __dirname + '/client'));
app.get('/', function(req, res){
    res.sendFile(__dirname + '/client/index.html');
});

app.get('/global', function(req, res){
    chat.emit('chat message', 'This is a global message!');
    res.send('OK!')
});

app.get('/status/:room', function(req, res){
    let clients = [];
    for (let socketID in chat.connected) {
        let socket = chat.connected[socketID]
        let requestedRoom = req.params.room || 'global';
        if (socket.room === requestedRoom) {
            clients.push({
                id: socket.id,
                room: socket.room,
                user: socket.user
            });
        }
    }
    res.send({ clients: clients });
});

var chat = io
.of('/chat')
.on('connection', function(socket){
    console.log(socket.id + ' connected');

    socket.on('chat message', function(data){
        console.log(socket.id + ': ' + data.msg);
        chat.to(socket.room).emit('chat message', {
            user: socket.user,
            msg: data.msg,
            time: new Date()
        });
    });

    socket.on('disconnect', function(reason){
        console.log(socket.id + ' disconnected');
        chat.to(socket.room).emit('chat message', {
            user: serverName,
            msg: socket.user + ' has left the chat',
            time: new Date()
        });
    });

    socket.on('join room', function(data){
        socket.room = data.room || 'global';
        socket.user = data.user || 'Guest#' + randomID(5);

        // the client join the room
        socket.join(socket.room);

        chat.to(socket.room).emit('chat message', {
            user: serverName,
            msg: socket.user + ' has joined the chat',
            time: new Date()
        });

        console.log(socket.user + ' has joined the chat ' + socket.room)
    });
});

http.listen(serverPort, serverHost, function(){
    console.log('listening on ' + serverHost + ':' + serverPort);
});

