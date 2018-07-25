(function(){
    "use strict";
    
    const app = angular.module("chat", ['httpRequest', 'notification']);
    const path = location.pathname.substring(0, location.pathname.lastIndexOf('/'));

    app.service("chatService", ['$log', '$routeParams', 'HttpRequestService', 'notificationService', 
    function($log, $routeParams, httpRequest, notificationService){
        var socket;

        return {

            joinChat: function(clientName, room){
                socket && socket.close();
                socket = io.connect('/chat', {
                    path: path + '/ws',
                    query: {
                        token: $routeParams.token
                    }
                });

                socket.on('validated', function(msg){
                    socket.emit('join room', {
                        room: room,
                        user: clientName,
                        token: $routeParams.token
                    });
                });

                // chat.on('join room noti', function(data){
                //     notificationService.notifyMe(data.user + " has joined the chat");
                // });

                return socket;
            },

            sendMessage: function(message){
                socket.emit('chat message', {
                    msg: message
                });
            },

            findClients: function(room){
                return httpRequest.request({
                    url: "status/" + room
                }).then(function( response ){
                    return response.data;
                });
            }

        };

    }]);

    
})();