(function(){
    "use strict";
    
    const app = angular.module("chat", ['httpRequest', 'notification']);
    const path = location.pathname.substring(0, location.pathname.lastIndexOf('/'));
    const host = '';

    app.service("chatService", ['$log', '$routeParams', '$q', 'HttpRequestService', 'notificationService', 
    function($log, $routeParams, $q, httpRequest, notificationService){
        var socket;

        socket = io.connect(host + '/chat', {
            path: path + '/ws',
            query: {
                token: $routeParams.token || '',
                user: $routeParams.clientName || ''
            }
        });

        socket.on('notification', function(data){
            notificationService.notifyMe(data.msg);
        });

        var deferValidated = $q.defer();
        socket.on('validated', function(msg){
            $log.log('client connected');
            deferValidated.resolve();
        });

        socket.on('disconnect', function(msg) {
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

            sendMessage: function(message, room){
                socket.emit('chat message', {
                    room: room,
                    msg: message
                });
            },

            loadMessages: (room) => {
                return httpRequest.request({
                    url: host + path + "/room/" + room
                }).then((response) => {
                    return response.data.messages || {};
                });
            },

            findClients: (room) => {
                return httpRequest.request({
                    url: host + path + "/room/" + room
                }).then(( response ) => {
                    return response.data.clients;
                });
            },

            findMyRooms: () => {
                if (socket.id) {
                    let clientID = socket.id.substring(socket.id.lastIndexOf('#') + 1);
                    return httpRequest.request({
                        url: host + path + "/client/" + clientID
                    }).then(( response ) => {
                        return response.data;
                    });
                }
                return $q.defer().promise;
            },

            findPublicRooms: () => {
                return httpRequest.request({
                    url: host + path + "/rooms"
                }).then(( response ) => {
                    return response.data;
                });
            }

        };

    }]);

    
})();