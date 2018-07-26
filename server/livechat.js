const express = require('express');
const app = express();
const http = require('http');
const server = http.Server(app);
const Store = require('data-store');
const randomID = require('random-id');
const winston = require('winston');
const config = require('./config');
const client = require('./client-validation')
const io = require('socket.io')(server, { path: config.server.webroot + '/ws' });
//const dataStore = new Store('dataStore', { path: 'data.json' });
//dataStore.clear();

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

app.use(config.server.webroot + '/libs', express.static( __dirname + '/../libs'));
app.use(config.server.webroot + '/', express.static( __dirname + '/../client'));
app.get(config.server.webroot + '/', function(req, res){
    res.sendFile(__dirname + '/../client/index.html');
});

app.get(config.server.webroot + '/global/:message', function(req, res){
    sendGlobalMessage(req.params.message || 'This is a global message!');
    res.send('OK!')
});

app.get(config.server.webroot + '/status/:room', function(req, res){
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
            sendMessage(socket.user, data.msg, socket.room);
        });

        socket.on('disconnect', (reason) => {
            logger.log('info', socket.id + ' disconnected');
            sendMessage(config.server.name, socket.user + ' has left the chat', socket.room);

            socket.broadcast.to(socket.room).emit('notification', {
                user: socket.user,
                time: new Date(),
                msg: socket.user + ' has left the chat'
            });
        });

        socket.on('join room', (data) => {
            socket.room = data.room || 'global';
            socket.user = data.user || 'Guest#' + randomID(5);

            // the client join the room
            socket.join(socket.room, () => {
                logger.log('info', socket.id + ' has joined the chat ' + socket.room)
                sendMessage(config.server.name, socket.user + ' has joined the chat', socket.room);
                
                socket.on('notification', (data) => {
                    logger.info('##1111');
                    //sendMessage(config.server.name, data.msg, socket.room);
                });

                socket.broadcast.to(socket.room).emit('notification', {
                    user: socket.user,
                    time: new Date(),
                    msg: socket.user + ' has joined the chat'
                });
            });
        });

        socket.emit('validated');
    });
});

logger.info(JSON.stringify(config));

server.listen(config.server.port, config.server.host, function(){
    logger.log('info', 'listening on ' + config.server.host + ':' + config.server.port);
});