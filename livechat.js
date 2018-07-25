const express = require('express');
const app = express();
const http = require('http');
const server = http.Server(app);
const io = require('socket.io')(server, { path: '/ws' });
const Store = require('data-store');
const randomID = require('random-id');
//const dataStore = new Store('dataStore', { path: 'data.json' });
//dataStore.clear();
const winston = require('winston');
const config = require('./config.js');
const client = require('./client-validation.js')

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

var validateConnection = (token, callback) => callback();
if (config.client.authentication.enabled) {
    validateConnection = client.validateClient;
}

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
        user: config.server.name,
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
    validateConnection(socket.handshake.query.token, () => {
        logger.log('info', socket.id + ' connected');

        socket.on('chat message', (data) => {
            //console.log(socket.id + ' writing: ' + data.msg);
            sendMessage(socket.user, data.msg, socket.room);
        });

        socket.on('disconnect', (reason) => {
            logger.log('info', socket.id + ' disconnected');
            sendMessage(config.server.name, socket.user + ' has left the chat', socket.room);
        });

        socket.on('join room', (data) => {
            socket.room = data.room || 'global';
            socket.user = data.user || 'Guest#' + randomID(5);

            // the client join the room
            socket.join(socket.room);

            sendMessage(config.server.name, socket.user + ' has joined the chat', socket.room);
            logger.log('info', socket.id + ' has joined the chat ' + socket.room)
            chat.to(socket.room).emit('join room noti', {
                user: socket.user,
                time: new Date()
            });
        });

        socket.emit('validated');
    });
});

server.listen(config.server.port, config.server.host, function(){
    logger.log('info', 'listening on ' + config.server.host + ':' + config.server.port);
});