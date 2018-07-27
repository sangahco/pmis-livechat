(function(){
    "use strict";

    var app = angular.module("chatManager", ['chat']);

    app.controller('ChatManagerController', ['$location', '$log', '$routeParams', '$scope', 'chatService', 
    function($location, $log, $routeParams, $scope, chatService){
        const $ctrl = this;
        $ctrl.rooms = [];
        $ctrl.activeRoom = "";

        const socket = chatService.socket;

        $ctrl.joinRoom = function(room){
            let rooms = $ctrl.rooms;
            if (!rooms.includes(room)){
                rooms.push(room);
            }
            $ctrl.activeRoom = room;
            chatService.joinRoom(room);

            $ctrl.roomName = "";
        }

        $ctrl.leaveRoom = function(room){
            let rooms = $ctrl.rooms;
            chatService.leaveRoom(room);
            rooms.splice(rooms.indexOf(room), 1);

            $ctrl.activeRoom = rooms[0];
        }

        $ctrl.findMyRooms = function(){
            chatService.findMyRooms().then((result) => {
                $ctrl.rooms = result.rooms;
            });
        }

        $ctrl.joinRoom($routeParams.room || "global");
    }]);

    app.component('chatManager', {
        templateUrl: 'chat-manager.html',
        controller: 'ChatManagerController'
    });

})();