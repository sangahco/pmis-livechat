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

var storeClientProfile = function(name, profilePicUrl, socket) {
    let clients = dataStore.get('clients') || {};
    dataStore.set('clients', clients);
    let clientID = randomID(16);
    let profile = {
        clientID: clientID,
        name: name,
        profilePicUrl: profilePicUrl,
        socketID: socket.id
    };
    dataStore.set('clients.' + clientID, profile);
    return profile;
}

module.exports.loadClientProfile = function(id) {
    return dataStore.get('clients.' + id);
}

module.exports.loadMessages = function(room){
    let messages = dataStore.get('rooms.' + room + '.messages');
    return messages;
}

var cleanStorage = function(){
    let rooms = chat.adapter.rooms;
    let storedRooms = dataStore.get('rooms');

    logger.info('Active rooms %s', Object.keys(rooms));

    Object.keys(storedRooms).forEach((key) => {
        logger.log('info', 'Checking room %s for cleanup', key);
        if (!rooms[key]) {
            delete storedRooms[key];
        }
    });
    dataStore.set('rooms', storedRooms);

    let connectedClients = chat.connected;
    let storedClients = dataStore.get('clients');
    Object.keys(storedClients).forEach((key) => {
        if (!connectedClients[storedClients[key].socketID]) {
            delete storedClients[key];
        }
    });
    dataStore.set('clients', storedClients);
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

        var remoteProfile = await clientAuth.retrieveClientProfile(socket.handshake.query.token);
        var clientProfile = storeClientProfile(
            remoteProfile.userName || socket.handshake.query.user || 'Guest#' + randomID(5), 
            null, socket);
        
        socket.clientID = clientProfile.clientID;

        socket.on('chat message', (data) => {
            handleMessage(clientProfile.name, data.msg, data.room);
        });

        socket.on('disconnecting', (reason) => {
            logger.log('info', clientProfile.clientID + ' disconnected');

            let rooms = Object.keys(socket.rooms);
            for (var i = 0; i < rooms.length; i++) {
                handleMessage(config.server.name, clientProfile.name + ' has left the chat', rooms[i]);
            }
            socket.broadcast.emit('notification', new Message(clientProfile.name + ' has left the chat', clientProfile.name));
        });

        socket.on('disconnect', () => {
            cleanStorage();
        });

        socket.on('join room', (data) => {
            let room = data.room || 'global';
            // the client join the room
            socket.join(room, () => {
                logger.log('info', clientProfile.clientID + ' has joined the chat ' + room)
                handleMessage(config.server.name, clientProfile.name + ' has joined the chat', room);
                socket.broadcast.to(room).emit('notification', new Message(clientProfile.name + ' has joined the chat', clientProfile.name));
            });
        });

        socket.on('leave room', (data) => {
            let rooms = Object.keys(socket.rooms);
            if (rooms.includes(data.room)){
                socket.leave(data.room);
                handleMessage(config.server.name, clientProfile.name + ' has left the chat', data.room);
                socket.broadcast.emit('notification', new Message(clientProfile.name + ' has left the chat', clientProfile.name));
            }
        });

        socket.emit('validated', { clientID: clientProfile.clientID });
    }, () => {
        // invalid nothing to do here
        // but leave this callback since we have to catch the rejected status
    });
});

server.listen(config.server.port, config.server.host, function(){
    logger.log('info', 'listening on ' + config.server.host + ':' + config.server.port);
});