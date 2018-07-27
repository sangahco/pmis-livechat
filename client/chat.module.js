(function(){
    "use strict";
    
    const app = angular.module("chat", ['httpRequest', 'notification']);
    const path = location.pathname.substring(0, location.pathname.lastIndexOf('/'));
    const host = '';

    app.service("chatService", ['$log', '$routeParams', 'HttpRequestService', 'notificationService', 
    function($log, $routeParams, httpRequest, notificationService){
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

        socket.on('validated', function(msg){
            $log.log('reconnected...');
        });

        return {

            socket: socket,

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

            findClients: (room) => {
                return httpRequest.request({
                    url: host + path + "/room/" + room
                }).then(( response ) => {
                    return response.data;
                });
            },

            findMyRooms: () => {
                
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