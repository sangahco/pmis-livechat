(function(){
    "use strict";

    var app = angular.module("chatManager", ['chat']);

    app.controller('ChatManagerController', 
    ['$location', '$log', '$routeParams', '$scope', '$interval', '$timeout', '$element', '$window', '$anchorScroll', 'chatService', 
    function($location, $log, $routeParams, $scope, $interval, $timeout, $element, $window, $anchorScroll, chatService){
        const $ctrl = this;
        $ctrl.publicRooms = [];
        $ctrl.rooms = ['global'];
        $ctrl.activeRoom = "";

        $ctrl.joinRoom = function(room){
            if (!room) return;

            let rooms = $ctrl.rooms;
            if (!rooms.includes(room)){
                rooms.push(room);
            }
            $ctrl.activeRoom = room;
            $ctrl.roomName = "";
            
            chatService.joinRoom(room);
        }

        $ctrl.leaveRoom = function(room){
            let rooms = $ctrl.rooms;
            chatService.leaveRoom(room);
            rooms.splice(rooms.indexOf(room), 1);

            $ctrl.activeRoom = rooms[0];
        }

        $ctrl.findMyRooms = function(){
            chatService.findMyRooms().then((result) => {
                $ctrl.rooms = result.rooms || [];
            });
        }

        $ctrl.findPublicRooms = async () => {
            let result = await chatService.findPublicRooms();
            $ctrl.publicRooms = result.rooms;
        }

        // join the default room on connection
        chatService.onConnected().then(() => $ctrl.joinRoom($routeParams.room || $ctrl.rooms[0]));

        var stopTime = $interval(function() { 
            $ctrl.findMyRooms();
            $ctrl.findPublicRooms();
        }, 2000);
        
        angular.element($window).on('resize', () => $scope.$emit('resize'));
        
        $element.on('$destroy', function() {
            $interval.cancel(stopTime);
            angular.element($window).off('resize');
        });
    }]);

    app.component('chatManager', {
        templateUrl: 'chat-manager.html',
        controller: 'ChatManagerController'
    });

})();