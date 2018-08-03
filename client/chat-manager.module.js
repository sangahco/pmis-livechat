(function(){
    "use strict";

    var app = angular.module("chatManager", ['chat']);

    app.controller('ChatManagerController', 
    ['$location', '$log', '$routeParams', '$scope', '$interval', '$element', '$window', '$anchorScroll', 'chatService', 
    function($location, $log, $routeParams, $scope, $interval, $element, $window, $anchorScroll, chatService){
        const $ctrl = this;
        $ctrl.publicRooms = [];
        $ctrl.rooms = [];
        $ctrl.activeRoom = "";
        $ctrl.unreadCount = {};

        $ctrl.joinRoom = function(room){
            if (!room) return;

            $ctrl.activeRoom = room;
            $ctrl.roomName = "";
            chatService.joinRoom(room);
            $ctrl.findMyRooms();
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

        $ctrl.setUnreadCount = (room, count) => {
            $ctrl.unreadCount[room] = count;
        }

        // join the default room on connection
        chatService.onConnected().then(() => $ctrl.joinRoom($routeParams.room || $ctrl.rooms[0]));

        var stopTime = $interval(function() { 
            $ctrl.findMyRooms();
            $ctrl.findPublicRooms();
        }, 2000);
                
        $element.on('$destroy', function() {
            $interval.cancel(stopTime);
        });
    }]);

    // chat manager as component
    app.component('chatManager', {
        templateUrl: 'chat-manager.html',
        controller: 'ChatManagerController'
    });

    // chat manager as directive
    // app.directive('chatManager', ['$window', function($window){
    //     return {
    //         restrict: 'E',
    //         templateUrl: 'chat-manager.html',
    //         controller: 'ChatManagerController',
    //         scope: {},
    //         controllerAs: '$ctrl',
    //         link: function(scope, element, attrs){
    //             angular.element($window).on('resize', () => {
    //                 scope.$emit('resize');
    //             });
        
    //             element.on('$destroy', function() {
    //                 angular.element($window).off('resize');
    //             });
    //         }
    //     }
    // }]);

})();