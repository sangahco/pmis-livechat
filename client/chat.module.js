(function(){
    "use strict";
    
    const app = angular.module("chat", ['httpRequest', 'notification']);
    const path = location.pathname.substring(0, location.pathname.lastIndexOf('/'));
    const host = '';

    app.service("chatService", ['$log', '$routeParams', '$q', 'HttpRequestService', 'notificationService', 
    function($log, $routeParams, $q, httpRequest, notificationService){
        var clientID;

        var socket = io.connect(host + '/chat', {
            path: path + '/ws',
            query: {
                token: $routeParams.token || '',
                user: $routeParams.clientName || ''
            }
        });

        socket.on('notification', function(data){
            notificationService.notifyMe(data.text);
        });

        var deferValidated = $q.defer();
        socket.on('validated', function(data){
            $log.log('client connected');
            deferValidated.resolve();
            clientID = data.clientID;
        });

        socket.on('disconnect', function() {
            $log.log('client disconnected');
            deferValidated = $q.defer();
        });
        
        return {

            socket: socket,

            onConnected: function() {
                return deferValidated.promise;
            },

            joinRoom: function(room){
                socket.emit('join room', {
                    room: room
                });
            },

            leaveRoom: (room) => {
                socket.emit('leave room', {
                    room: room
                });
            },

            saveMessage: function(message, room){
                socket.emit('chat message', {
                    room: room,
                    msg: message
                });
            },

            saveRoomSettings: (settings, room) => {
                return httpRequest.request({
                    url: host + path + "/room/" + room,
                    method: 'POST',
                    data: settings
                }).then((response) => {
                });
            },

            loadMessages: (room) => {
                return httpRequest.request({
                    url: host + path + "/room/" + room + "/messages"
                }).then((response) => {
                    return response.data.messages || {};
                });
            },

            loadSettings: (room) => {
                return httpRequest.request({
                    url: host + path + "/room/" + room + "/settings"
                }).then((response) => {
                    return response.data.settings || {};
                });
            },

            findClients: (room) => {
                return httpRequest.request({
                    url: host + path + "/room/" + room + "/clients"
                }).then(( response ) => {
                    return response.data.clients;
                });
            },

            findMyRooms: () => {
                return httpRequest.request({
                    url: host + path + "/client/" + clientID
                }).then(( response ) => {
                    return response.data;
                });
            },

            findPublicRooms: () => {
                return httpRequest.request({
                    url: host + path + "/rooms"
                }).then(( response ) => {
                    return response.data;
                });
            },

            authenticate: () => {
                return httpRequest.request({
                    url: host + path + "/login",
                    params: { token: $routeParams.token }
                });
            },

            // Saves a new message containing an image in Firebase.
            // This first saves the image in Firebase storage.
            saveImageMessage: (file, roomID) => {
                var filePath = file.name;
                return firebase.storage().ref(filePath).put(file).then(function(fileSnapshot) {
                    // 3 - Generate a public URL for the file.
                    return fileSnapshot.ref.getDownloadURL().then((url) => {
                        // 4 - Update the chat message placeholder with the image’s URL.
                        socket.emit('chat message', {
                            room: roomID,
                            msg: '',
                            imageUrl: url
                        });
                    });
                }).catch(function(error) {
                    console.error('There was an error uploading a file to Cloud Storage:', error);
                });
            }

        };

    }]);

    
})();