(function(){
    "use strict";

    var app = angular.module("chatView", ["chat"])

    app.directive("message", [function(){
        return {
            restrict: "E",
            replace: true,
            templateUrl: function(elem, attrs){
                return "msg-me.html";
            }
        };
    }]);

    app.controller('ChatViewController', ["$log", "$element", "$scope", "$interval", "chatService",
    function ChatViewController($log, $element, $scope, $interval, chatService) {
        const $ctrl = this;
        const socket = chatService.socket;

        $ctrl.messages = [];
        $ctrl.roomName = $ctrl.roomName || 'global';
        $ctrl.clients = [];

        var chatMessageCallback = function(room, data){
            $log.log('on chat message');
            if ($ctrl.roomName === room) {
                $ctrl.messages.push(data);
                $scope.$digest();

                // let messagesDom = angular.element(document).find('.messages');
                // console.log(messagesDom);
                //.scrollTop = angular.element('.messages').scrollHeight
            }
        }

        socket.on('chat message', chatMessageCallback);

        $ctrl.sendMessage = function(msg){
            msg && chatService.sendMessage(msg, $ctrl.roomName);
            $ctrl.message = '';
        }

        $ctrl.findClients = function(){
            chatService.findClients($ctrl.roomName)
            .then(function(clients){
                $ctrl.clients = clients;
            });
        }

        $scope.$watch($ctrl.roomName, async () => {
            let messages = await chatService.loadMessages($ctrl.roomName)
            let messageKeys = Object.keys(messages);
            for (let i = 0; i < messageKeys.length; i++) {
                let key = messageKeys[i];
                $ctrl.messages.push({
                    user: messages[key].name,
                    msg: messages[key].text,
                    time: messages[key].time
                });
            }
        });
        
        var stopTime = $interval(function() {
            if ($ctrl.active) {
                $ctrl.findClients();
            }
        }, 2000);
        
        $element.on('$destroy', function() {
            $interval.cancel(stopTime);
            socket.off('chat message', chatMessageCallback);
        });

        $scope.$emit('resize');
    }]);

    app.component('chat', {
        templateUrl: 'chat.html',
        controller: 'ChatViewController',
        bindings: {
            roomName: '<',
            leaveRoom: '<',
            publicRooms: '<',
            joinRoom: '<',
            active: '<'
        }
    });

})();