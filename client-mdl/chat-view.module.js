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
            active: '<'
        }
    });

    app.controller('ChatViewController', ["$log", "$element", "$scope", "$interval", "chatService",
    function ChatViewController($log, $element, $scope, $interval, chatService) {
        const $ctrl = this;
        const socket = chatService.socket;

        $ctrl.messages = [];
        $ctrl.roomName = $ctrl.roomName || 'global';
        $ctrl.clients = [];

        var chatMessageCallback = function(room, message){
            if (!room || $ctrl.roomName === room) {
                $ctrl.messages.push(message);
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
                $ctrl.messages.push(messages[key]);
            }
        }

        $scope.$watch($ctrl.roomName, loadMessages);
        
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