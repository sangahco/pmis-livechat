const express = require('express');
const config = require('./config.js');

module.exports = function(app, io){
    let chat = io;

    app.use(config.server.webroot + '/libs', express.static( __dirname + '/../libs'));
    app.use(config.server.webroot + '/', express.static( __dirname + '/../client'));
    app.get(config.server.webroot + '/', function(req, res){
        res.sendFile(__dirname + '/../client/index.html');
    });

    app.get(config.server.webroot + '/global/:message', function(req, res){
        sendGlobalMessage(req.params.message || 'This is a global message!');
        res.send('OK!')
    });

    app.get(config.server.webroot + '/rooms', function(req, res){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");

        let response = { rooms: [] };

        let rooms = Object.keys(chat.adapter.rooms);
        for (var i = 0; i < rooms.length; i++) {
            let roomName = rooms[i];
            if (!roomName.startsWith('/chat#')) {
                let room = {
                    name: roomName,
                    clients: []
                };
                
                let sockets = Object.keys(chat.adapter.rooms[roomName].sockets);
                for (var j = 0; j < sockets.length; j++) {
                    let socketName = sockets[j];
                    let socket = chat.sockets[socketName];
                    room.clients.push(socket.user);
                }
                response.rooms.push(room);
            }
        }
        res.send(response);
    });

    app.get(config.server.webroot + '/room/:room', function(req, res){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");

        let clients = [];
        for (let socketID in chat.connected) {
            let socket = chat.connected[socketID]
            let requestedRoom = req.params.room || 'global';
            
            if (Object.keys(socket.rooms).includes(req.params.room)) {
                clients.push({
                    id: socket.id,
                    room: req.params.room,
                    user: socket.user
                });
            }
        }
        res.send({ clients: clients });
    });

    // app.get(config.server.webroot + '/socket/:socketID', function(req, res){
    //     let response = {};

    //     let socket = chat.sockets[req.params.socketID];
    //     if (socket) {
    //         let rooms = Object.keys(socket.rooms);
    //         response = {
    //             rooms: rooms,
    //             user: socket.user,
    //             id: socket.id
    //         };
    //     }
        
    //     res.send(response)
    // });
}