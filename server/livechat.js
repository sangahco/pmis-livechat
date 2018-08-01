const express = require('express');
const app = express();
const http = require('http');
const server = http.Server(app);
const Store = require('data-store');
const randomID = require('random-id');
const config = require('./config');
const client = require('./client-validation')
const io = require('socket.io')(server, { path: config.server.webroot + '/ws' });
const chat = io.of('/chat');
const logger = require('./logger');

require('./http-routes')(app, chat);

const dataStore = new Store('dataStore', { path: 'data.json' });
//dataStore.clear();

var validateConnection = () => { return new Promise((resolve) => resolve())};
if (config.client.authentication.enabled) {
    validateConnection = client.validateClient;
}

var sendGlobalMessage = function(message) {
    chat.emit('chat message', null, {
        user: config.server.name,
        msg: message,
        time: new Date()
    });
}

var sendMessage = function(user, message, room) {
    chat.to(room).emit('chat message', room, {
        user: user,
        msg: message,
        time: new Date()
    });
}

chat.on('connection', (socket) => {
    validateConnection(socket.handshake.query.token)
    .then(function(){
        
        logger.log('info', socket.id + ' connected');

        socket.user = socket.user || socket.handshake.query.user || 'Guest#' + randomID(5);

        socket.on('chat message', (data) => {
            sendMessage(socket.user, data.msg, data.room);
        });

        socket.on('disconnecting', (reason) => {
            logger.log('info', socket.id + ' disconnected');

            let rooms = Object.keys(socket.rooms);
            for (var i = 0; i < rooms.length; i++) {
                sendMessage(config.server.name, socket.user + ' has left the chat', rooms[i]);
            }

            socket.broadcast.emit('notification', {
                user: socket.user,
                time: new Date(),
                msg: socket.user + ' has left the chat'
            });
        });

        socket.on('join room', (data) => {
            let room = data.room || 'global';
            // the client join the room
            socket.join(room, () => {
                logger.log('info', socket.id + ' has joined the chat ' + room)
                sendMessage(config.server.name, socket.user + ' has joined the chat', room);

                // send a callback to the client with the room joined
                //chat.to(socket.id).emit('joined', room, { rooms: Object.keys(socket.rooms) });

                socket.broadcast.to(room).emit('notification', {
                    user: socket.user,
                    time: new Date(),
                    msg: socket.user + ' has joined the chat'
                });

            });
        });

        socket.on('leave room', (data) => {
            let rooms = Object.keys(socket.rooms);
            if (rooms.includes(data.room)){
                socket.leave(data.room);
                sendMessage(config.server.name, socket.user + ' has left the chat', data.room);
                socket.broadcast.emit('notification', {
                    user: socket.user,
                    time: new Date(),
                    msg: socket.user + ' has left the chat'
                });
            }
        });

        socket.emit('validated');
    });
});

logger.info(JSON.stringify(config));

server.listen(config.server.port, config.server.host, function(){
    logger.log('info', 'listening on ' + config.server.host + ':' + config.server.port);
});