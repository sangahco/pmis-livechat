(function(){
    "use strict";

    var app = angular.module("chatView", ["chat"])

    app.directive("message", ["$log", "$rootScope", function($log, $rootScope){
        return {
            restrict: "E",
            templateUrl: function(elem, attrs){
                return "msg-me.html";
            }
        };
    }]);

    app.controller('ChatViewController', ["$log", "$routeParams", "$element", "$rootScope", "$scope", "$interval", "chatService",
    function ChatViewController($log, $routeParams, $element, $rootScope, $scope, $interval, chatService) {
        const $ctrl = this;
        const socket = chatService.socket;

        $ctrl.messages = [];
        $ctrl.roomName = $ctrl.roomName || 'global';
        $ctrl.clients = [];
        $ctrl.rooms = [];

        socket.on('chat message', function(room, data){
            $log.log('on chat message');
            if ($ctrl.roomName === room) {
                $ctrl.messages.push(data);
                $scope.$digest();
            }
        });

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
        }, 5000);

        // listen on DOM destroy (removal) event, and cancel the next UI update
        // to prevent updating time after the DOM element was removed.
        $element.on('$destroy', function() {
            $interval.cancel(stopTime);
        });
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