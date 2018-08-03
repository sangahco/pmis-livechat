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

    app.directive("messages", ['$log', function($log){
        function link(scope, element, attrs) {
            scope.$watch('$ctrl.messages', function(value) {
                element[0].scrollTop = element[0].scrollHeight;
            }, true);

        }
        
        return {
            restrict: "C",
            link: link
        }
    }]);

    app.component('chat', {
        templateUrl: 'chat.html',
        controller: 'ChatViewController',
        bindings: {
            roomName: '<',
            leaveRoom: '<',
            publicRooms: '<',
            joinRoom: '<',
            active: '<',
            setUnreadCount: '<'
        }
    });

    app.controller('ChatViewController', ["$log", "$element", "$scope", "$interval", "chatService",
    function ChatViewController($log, $element, $scope, $interval, chatService) {
        const $ctrl = this;
        const socket = chatService.socket;

        $ctrl.messages = [];
        $ctrl.roomName = $ctrl.roomName || 'global';
        $ctrl.clients = [];
        $ctrl.unreadCount = 0;

        var chatMessageCallback = function(room, message){
            if (!room || $ctrl.roomName === room) {
                pushMessage(message);
                if (!$ctrl.active) {
                    $ctrl.unreadCount++;
                    $ctrl.setUnreadCount($ctrl.roomName, $ctrl.unreadCount);
                }
                $scope.$digest();
            }
        }

        socket.on('chat message', chatMessageCallback);

        $ctrl.sendMessage = function(msg){
            msg && chatService.sendMessage(msg, $ctrl.roomName);
            $ctrl.message = '';
        }

        var findClients = async () => {
            $ctrl.clients = await chatService.findClients($ctrl.roomName);
        }

        var loadMessages = async () => {
            let messages = await chatService.loadMessages($ctrl.roomName)
            let messageKeys = Object.keys(messages);
            for (let i = 0; i < messageKeys.length; i++) {
                let key = messageKeys[i];
                pushMessage(messages[key]);
            }
        }

        var pushMessage = function(message){
            let found = false;
            $ctrl.messages.forEach(msg => {
                if (msg.id == message.id) {
                    found = true;
                    return;
                }
            });
            !found && $ctrl.messages.push(message);
        }

        $scope.$watch('$ctrl.roomName', loadMessages);

        $scope.$watch('$ctrl.active', (newVal, oldVal) => {
            if (newVal) $ctrl.unreadCount = 0;
            $ctrl.setUnreadCount($ctrl.roomName, $ctrl.unreadCount);
        });
        
        var stopTime = $interval(function() {
            if ($ctrl.active) {
                findClients();
            }
        }, 2000);
        
        $element.on('$destroy', function() {
            $interval.cancel(stopTime);
            socket.off('chat message', chatMessageCallback);
        });

        $scope.$emit('resize');
    }]);

})();