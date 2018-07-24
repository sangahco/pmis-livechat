(function(){
    "use strict";

    var app = angular.module("chatView", ["chat"])

    app.service("chatViewService", ['$location', '$routeParams', 
    function($location, $routeParams){
        return {
            changeRoom: function(room, user){
                if (room && user) {
                    $location.path('/chat/' + room + '/user/' + user);
                }
                else if (room) {
                    $location.path('/chat/' + room);
                }
            }
        };
    }]);

    app.directive("message", ["$log", "$rootScope", function($log, $rootScope){
        return {
            restrict: "E",
            templateUrl: function(elem, attrs){
                return "msg-me.html";
            }
        };
    }]);

    app.component('chat', {
        templateUrl: 'chat.html',
        controller: ["$log", "$routeParams", "$element", "$rootScope", "$scope", "$interval", "chatService", "chatViewService", 
        function($log, $routeParams, $element, $rootScope, $scope, $interval, chatService, chatViewService){
            var $ctrl = this;
            $scope.messages = [];
            $scope.roomName = $routeParams.room || 'global';
            $scope.clientName = $routeParams.clientName;

            var chat = chatService.joinChat($scope.clientName, $scope.roomName);
            chat.on('chat message', function(data){
                $scope.messages.push(data);
                $scope.$digest();
            });

            $ctrl.viewService = chatViewService;

            $ctrl.sendMessage = function(msg){
                msg && chatService.sendMessage(msg);
                $scope.message = '';
            }

            $ctrl.findClients = function(room){
                chatService.findClients(room)
                .then(function(result){
                    $scope.clients = result.clients;
                });
            }

            var stopTime = $interval(function() { $ctrl.findClients($scope.roomName) }, 5000);

            // listen on DOM destroy (removal) event, and cancel the next UI update
            // to prevent updating time after the DOM element was removed.
            $element.on('$destroy', function() {
                $interval.cancel(stopTime);
            });
        }]
    });

})();