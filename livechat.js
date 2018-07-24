const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { path: '/ws' });
const Store = require('data-store');
const randomID = require('random-id');
//const dataStore = new Store('dataStore', { path: 'data.json' });
//dataStore.clear();
const config = require('./config.json');
const winston = require('winston');

let logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(info => {
            return `${info.timestamp} ${info.level}: ${info.message}`;
        })
    ),
    transports: [new winston.transports.Console()]
});

var serverPort = process.env.SERVER_PORT || config.server.port;
var serverHost = process.env.SERVER_HOST || config.server.host;
var serverName = process.env.SERVER_NAME || config.server.name;

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

app.get('/global/:message', function(req, res){
    sendGlobalMessage(req.params.message || 'This is a global message!');
    res.send('OK!')
});

app.get('/status/:room', function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

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

var sendGlobalMessage = function(message) {
    chat.emit('chat message', {
        user: serverName,
        msg: message,
        time: new Date()
    });
}

var sendMessage = function(user, message, room) {
    chat.to(room).emit('chat message', {
        user: user,
        msg: message,
        time: new Date()
    });
}

var chat = io
.of('/chat')
.on('connection', (socket) => {
    logger.log('info', socket.id + ' connected');

    socket.on('chat message', (data) => {
        //console.log(socket.id + ' writing: ' + data.msg);
        sendMessage(socket.user, data.msg, socket.room);
    });

    socket.on('disconnect', (reason) => {
        logger.log('info', socket.id + ' disconnected');
        sendMessage(serverName, socket.user + ' has left the chat', socket.room);
    });

    socket.on('join room', (data) => {
        socket.room = data.room || 'global';
        socket.user = data.user || 'Guest#' + randomID(5);

        // the client join the room
        socket.join(socket.room);

        sendMessage(serverName, socket.user + ' has joined the chat', socket.room);
        logger.log('info', socket.id + ' has joined the chat ' + socket.room)
        chat.to(socket.room).emit('join room noti', {
            user: socket.user,
            time: new Date()
        });
    });
});

http.listen(serverPort, serverHost, function(){
    logger.log('info', 'listening on ' + serverHost + ':' + serverPort);
});

