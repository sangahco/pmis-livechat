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
    dataStore.set('rooms.' + room + '.messages.' + message.id, message);
}

var storeClientProfile = function(id, name, profilePicUrl) {
    let clients = dataStore.get('clients') || {};
    dataStore.set('clients', clients);
    dataStore.set('clients.' + id, {
        name: name,
        profilePicUrl: profilePicUrl
    });
}

var loadClientProfile = function(id) {
    return dataStore.get('clients.' + id);
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
        socket.user = clientProfile.userName || socket.handshake.query.user || 'Guest#' + randomID(5);

        socket.on('chat message', (data) => {
            handleMessage(socket.user, data.msg, data.room);
        });

        socket.on('disconnecting', (reason) => {
            logger.log('info', socket.id + ' disconnected');

            let rooms = Object.keys(socket.rooms);
            for (var i = 0; i < rooms.length; i++) {
                handleMessage(config.server.name, socket.user + ' has left the chat', rooms[i]);
            }
            socket.broadcast.emit('notification', new Message(socket.user + ' has left the chat', socket.user));
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
                socket.broadcast.to(room).emit('notification', new Message(socket.user + ' has joined the chat', socket.user));

            });
        });

        socket.on('leave room', (data) => {
            let rooms = Object.keys(socket.rooms);
            if (rooms.includes(data.room)){
                socket.leave(data.room);
                handleMessage(config.server.name, socket.user + ' has left the chat', data.room);
                socket.broadcast.emit('notification', new Message(socket.user + ' has left the chat', socket.user));
            }
        });

        socket.emit('validated');
    }, () => {
        // invalid nothing to do here
        // but leave this callback since we have to catch the rejected status
    });
});

server.listen(config.server.port, config.server.host, function(){
    logger.log('info', 'listening on ' + config.server.host + ':' + config.server.port);
});