(function(){
    "use strict";

    var app = angular.module("chatView", ["chat"])

    app.directive("message", [function(){
        return {
            restrict: "E",
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
        $ctrl.rooms = [];

        var chatMessageCallback = function(room, data){
            $log.log('on chat message');
            if ($ctrl.roomName === room) {
                $ctrl.messages.push(data);
                $scope.$digest();
            }
        }

        socket.on('chat message', chatMessageCallback);

        $ctrl.sendMessage = function(msg){
            msg && chatService.sendMessage(msg, $ctrl.roomName);
            $ctrl.message = '';
        }

        $ctrl.findClients = function(){
            chatService.findClients($ctrl.roomName)
            .then(function(result){
                $ctrl.clients = result.clients;
            });
        }

        var stopTime = $interval(function() { 
            $ctrl.findClients();
        }, 10000);
        
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
            leaveRoom: '&'
        }
    });

})();