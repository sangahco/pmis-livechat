(function(){
    "use strict";
    
    const app = angular.module("chat", ['httpRequest', 'notification']);
    const path = location.pathname.substring(0, location.pathname.lastIndexOf('/'));

    app.service("chatService", ['$log', 'HttpRequestService', 'notificationService', 
    function($log, httpRequest, notificationService){
        var chat;

        return {

            joinChat: function(clientName, room){
                chat && chat.close();
                chat = io.connect('/chat', {path: path + '/ws'});

                chat.on('connect', function(msg){
                    chat.emit('join room', {
                        room: room,
                        user: clientName
                    });
                });

                // chat.on('join room noti', function(data){
                //     notificationService.notifyMe(data.user + " has joined the chat");
                // });

                return chat;
            },

            sendMessage: function(message){
                chat.emit('chat message', {
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