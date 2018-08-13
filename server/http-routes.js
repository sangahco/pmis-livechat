const express = require('express');
const config = require('./config.js');
const clientAuth = require('./client-validation')
//const firebaseAdmin = require('./firebase-admin');
const livechat = require('./livechat');
const session = require('client-sessions');
const path = require('path');
const bodyParser = require('body-parser');

var requireLogin = function(req, res, next) {
    if (req.session && req.session.status == 'ok') {
        next();
    } else {
        clientAuth.validateClient(req.query.token)
        .then(() => {
            req.session.status = 'ok';
            next();
        })
        .catch((error) => {
            req.session && req.session.reset();
            res.status(error.statusCode || 400).send(error);
        });
    }
}

module.exports = function(app, io){
    let chat = io;

    app.use(bodyParser.json()); // for parsing application/json

    app.use(session({
        cookieName: 'session',
        secret: 'really secret here',
        duration: 30 * 60 * 1000,
        activeDuration: 5 * 60 * 1000,
    }));

    app.get(config.server.webroot + '/', function (req, res){
        res.sendFile(path.resolve(__dirname + '/../client/index.html'));
    });

    // static asset after the root path
    app.use(config.server.webroot + '/libs', express.static( __dirname + '/../libs'));
    app.use(config.server.webroot + '/', express.static( __dirname + '/../client'));

    app.get(config.server.webroot + '/logout', function(req, res) {
        req.session && req.session.reset();
        res.redirect(config.server.webroot + '/');
    });

    app.get(config.server.webroot + '/login', requireLogin, function(req, res) {
        res.json(req.session);
    });

    app.get(config.server.webroot + '/global/:message', requireLogin, function (req, res){
        livechat.sendGlobalMessage(req.params.message || 'This is a global message!');
        
        res.json({status: 'OK!'});
    });

    app.get(config.server.webroot + '/rooms', requireLogin, function (req, res){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");

        let response = { rooms: [] };

        Object.keys(livechat.loadRooms()).forEach((roomID) => {
            let room = livechat.loadRoom(roomID);
            if (roomID.startsWith(livechat.namespace + '#') || room.settings.unlisted) {
            } else {
                response.rooms.push(room);
            }
        });
        res.json(response);
    });

    app.get(config.server.webroot + '/room/:room/messages', requireLogin, function(req, res){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");

        let messages = livechat.loadMessages(req.params.room);
        let response = {messages: messages};

        res.send(response);
    });

    app.get(config.server.webroot + '/room/:room/clients', requireLogin, function(req, res){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");

        let clients = [];
        for (let socketID in chat.connected) {
            let socket = chat.connected[socketID]
            let requestedRoom = req.params.room || 'global';
            let clientProfile = livechat.loadClientProfile(socket.clientID);
            if (Object.keys(socket.rooms).includes(req.params.room)) {
                clients.push({
                    id: clientProfile.clientID,
                    user: clientProfile.name
                });
            }
        }

        let response = { clients: clients };

        res.send(response);
    });

    app.get(config.server.webroot + '/room/:room/settings', requireLogin, function(req, res){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");

        let response = {};
        let room = livechat.loadRoom(req.params.room);
        if (room) {
            response = { settings: room.settings };
        }
        res.send(response);
    });

    app.post(config.server.webroot + '/room/:room', requireLogin, function(req, res){
        let room = livechat.loadRoom(req.params.room);
        if (room) {
            room.setUnlisted(req.body.unlisted);
            room.setRoomName(req.body.roomName);
            livechat.storeRoom(room);
        }
        
        res.json({status: 'OK!'});
    });

    app.get(config.server.webroot + '/client/:client', requireLogin, function(req, res){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        
        let response = {};

        let clientProfile = livechat.loadClientProfile(req.params.client);
        if (clientProfile) {
            response = {
                rooms: [],
                user: clientProfile.name,
                id: clientProfile.clientID
            };

            let socket = chat.sockets[clientProfile.socketID];
            if (socket) {
                Object.keys(socket.rooms).forEach((room) => {
                    if (!room.startsWith(livechat.namespace + '#')) {
                        response.rooms.push(room);
                    }
                });
            }
        }
        
        res.send(response)
    });

    // app.get(config.server.webroot + '/auth/:token', function(req, res){
    //     clientValidation.validateClient(req.params.token)
    //     .then(async (result) => {
    //         let uid = '1234';
    //         let firebaseToken = await firebaseAdmin.auth().createCustomToken(uid)
    //         .catch(function(error) {
    //             console.log("Error creating custom token:", error);
    //             res.send(error);
    //         });

    //         res.send({ token: firebaseToken });
    //     })
    //     .catch((error) => {
    //         res.send(error);
    //     });
    // });
}