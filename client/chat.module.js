(function(){
    "use strict";
    
    const app = angular.module("chat", ['httpRequest', 'notification']);
    const path = location.pathname.substring(0, location.pathname.lastIndexOf('/'));
    const host = '';

    app.service("chatService", ['$log', '$routeParams', 'HttpRequestService', 'notificationService', 
    function($log, $routeParams, httpRequest, notificationService){
        var socket;

        return {

            joinChat: function(clientName, room){
                socket && socket.close();
                socket = io.connect(host + '/chat', {
                    path: path + '/ws',
                    query: {
                        token: $routeParams.token
                    }
                });

                socket.on('validated', function(msg){
                    
                    socket.emit('join room', {
                        room: room,
                        user: clientName
                    });

                });

                socket.on('notification', function(data){
                    notificationService.notifyMe(data.msg);
                });

                return socket;
            },

            sendMessage: function(message){
                socket.emit('chat message', {
                    msg: message
                });
            },

            findClients: function(room){
                return httpRequest.request({
                    url: host + path + "/status/" + room
                }).then(function( response ){
                    return response.data;
                });
            }

        };

    }]);

    
})();