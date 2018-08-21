const express = require('express');
const app = express();
const http = require('http');
const server = http.Server(app);
const Store = require('data-store');
const randomID = require('random-id');
const config = require('./config');
const clientAuth = require('./client-validation')
const io = require('socket.io')(server, { path: config.server.webroot + '/ws' });
const logger = require('./logger');
const Message = require('./message');
const Room = require('./room');
const session = require('client-sessions');
const botProfile = require('./bot-profile');
const dataStore = new Store('dataStore', { path: 'data.json' });
//dataStore.clear();

const namespace = '/chat';
const chat = io.of(namespace);

var sendGlobalMessage = function(text) {
    let message = new Message(text, config.server.name);
    chat.emit('chat message', null, message);
}

var storeRoom = function(room){
    dataStore.set('rooms.' + room.roomID + '.settings', room.settings);
    dataStore.set('rooms.' + room.roomID + '.clients', room.clients);
}

var loadRoom = function(roomID){
    let roomObj;
    if (dataStore.hasOwn('rooms.' + roomID)) {
        let storedSettings = dataStore.get('rooms.' + roomID + '.settings');
        let storedClients = dataStore.get('rooms.' + roomID + '.clients');
        roomObj = new Room(roomID, storedSettings, storedClients);
    }
    return roomObj;
}

var sendMessage = function(message, room) {
    chat.to(room).emit('chat message', room, message);
}

var storeMessage = function(message, room){
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

var loadClientProfile = function(id) {
    return dataStore.get('clients.' + id);
}

var loadMessages = function(room){
    let messages = dataStore.get('rooms.' + room + '.messages');
    return messages || {};
}

var loadRooms = function() {
    let rooms = dataStore.get('rooms');
    return rooms || {};
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

var updateRoomClients = function() {
    //logger.info('Refreshing rooms clients...');
    Object.keys(loadRooms()).forEach(roomID => {
        let room = loadRoom(roomID);
        room.clients = [];

        let chatAdapterRoom = chat.adapter.rooms[roomID];
        if (chatAdapterRoom) {
            let sockets = Object.keys(chatAdapterRoom.sockets);
            sockets.forEach((socketID) => {
                let socket = chat.sockets[socketID];
                let clientProfile = loadClientProfile(socket.clientID);
                room.clients.push(clientProfile);
            });
        }
        storeRoom(room);
    });
}
setInterval(updateRoomClients, 5000);

var handleMessage = function(text, clientProfile, room) {
    let message = new Message(text, clientProfile.name, clientProfile.profilePicUrl);

    sendMessage(message, room);
    storeMessage(message, room);
}

chat.on('connection', (socket) => {
    clientAuth.validateClient(socket.handshake.query.token)
    .then(async function(){
        const remoteProfile = await clientAuth.retrieveClientProfile(socket.handshake.query.token);
        const clientProfile = storeClientProfile(
            remoteProfile.userName || socket.handshake.query.user || 'Guest#' + randomID(5), 
            null, socket);
        
        logger.log('info', clientProfile.clientID + ' connected');
        socket.clientID = clientProfile.clientID;

        socket.on('chat message', (data) => {
            handleMessage(data.msg, clientProfile, data.room);
        });

        socket.on('disconnecting', (reason) => {
            logger.log('info', clientProfile.clientID + ' disconnected');

            let rooms = Object.keys(socket.rooms);
            for (var i = 0; i < rooms.length; i++) {
                handleMessage(clientProfile.name + ' has left the chat', botProfile, rooms[i]);
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
                handleMessage(clientProfile.name + ' has joined the chat', botProfile, room);
                socket.broadcast.to(room).emit('notification', new Message(clientProfile.name + ' has joined the chat', clientProfile.name));
            });
        });

        socket.on('leave room', (data) => {
            let rooms = Object.keys(socket.rooms);
            if (rooms.includes(data.room)){
                socket.leave(data.room);
                handleMessage(clientProfile.name + ' has left the chat', botProfile, data.room);
                socket.broadcast.emit('notification', new Message(clientProfile.name + ' has left the chat', clientProfile.name));
            }
        });

        socket.emit('validated', { clientID: clientProfile.clientID });
    }, () => {
        // invalid nothing to do here
        // but leave this callback since we have to catch the rejected status
    });
});

module.exports = {
    loadRoom: loadRoom,
    storeRoom: storeRoom,
    namespace: namespace,
    sendGlobalMessage: sendGlobalMessage,
    loadMessages: loadMessages,
    loadRooms: loadRooms,
    loadClientProfile: loadClientProfile
};

require('./http-routes')(app, chat);

server.listen(config.server.port, config.server.host, function(){
    logger.log('info', 'listening on ' + config.server.host + ':' + config.server.port);
});