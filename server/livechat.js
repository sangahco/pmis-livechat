const express = require('express');
const app = express();
const http = require('http');
const server = http.Server(app);
const Store = require('data-store');
const randomID = require('random-id');
const config = require('./config');
const clientAuth = require('./client-validation')
const io = require('socket.io')(server, { path: config.server.webroot + '/ws' });
const chat = io.of('/chat');
const logger = require('./logger');
const Message = require('./message');
require('./http-routes')(app, chat);
const session = require('client-sessions');



const dataStore = new Store('dataStore', { path: 'data.json' });
//dataStore.clear();

module.exports.sendGlobalMessage = function(text) {
    let message = new Message(text, config.server.name);
    console.log(message);
    chat.emit('chat message', null, message);
}

var sendMessage = function(message, room) {
    chat.to(room).emit('chat message', room, message);
}

var storeMessage = function(message, room){
    let rooms = dataStore.get('rooms') || {};
    dataStore.set('rooms', rooms);
    let messages = dataStore.get('rooms.' + room + '.messages') || {};
    dataStore.set('rooms.' + room + '.messages', messages);

    //messages[message.id] = message;
    dataStore.set('rooms.' + room + '.messages.' + message.id, message);
    //messages[randomID(16)] = { name: user, text: message, time: new Date(), profilePicUrl: '' };
}

module.exports.loadMessages = function(room){
    let messages = dataStore.get('rooms.' + room + '.messages');
    return messages;
}

var cleanStorage = function(){
    let rooms = chat.adapter.rooms;
    let cachedRooms = dataStore.get('rooms');

    logger.info('Active rooms %s', Object.keys(rooms));

    Object.keys(cachedRooms).forEach((key) => {
        logger.log('info', 'Checking room %s for cleanup', key);
        if (!rooms[key]) {
            delete cachedRooms[key];
        }
    });

    dataStore.set('rooms', cachedRooms);
}

var handleMessage = function(name, text, room) {
    let message = new Message(text, name);

    sendMessage(message, room);
    storeMessage(message, room);
}

chat.on('connection', (socket) => {
    clientAuth.validateClient(socket.handshake.query.token)
    .then(async function(){
        
        logger.log('info', socket.id + ' connected');

        let clientProfile = await clientAuth.retrieveClientProfile(socket.handshake.query.token);
        socket.user = clientProfile.userName || socket.user || socket.handshake.query.user || 'Guest#' + randomID(5);

        socket.on('chat message', (data) => {
            handleMessage(socket.user, data.msg, data.room);
        });

        socket.on('disconnecting', (reason) => {
            logger.log('info', socket.id + ' disconnected');

            let rooms = Object.keys(socket.rooms);
            for (var i = 0; i < rooms.length; i++) {
                handleMessage(config.server.name, socket.user + ' has left the chat', rooms[i]);
            }

            socket.broadcast.emit('notification', {
                user: socket.user,
                time: new Date(),
                msg: socket.user + ' has left the chat'
            });
        });

        socket.on('disconnect', () => {
            cleanStorage();
        });

        socket.on('join room', (data) => {
            let room = data.room || 'global';
            // the client join the room
            socket.join(room, () => {
                logger.log('info', socket.id + ' has joined the chat ' + room)
                handleMessage(config.server.name, socket.user + ' has joined the chat', room);

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
                handleMessage(config.server.name, socket.user + ' has left the chat', data.room);
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