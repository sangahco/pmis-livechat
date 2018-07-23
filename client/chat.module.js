(function(){
    "use strict";

    var serverHost = '//203.239.21.69:3000' //window.location;

    var app = angular.module("chat", ['httpRequest'])

    app.service("chatService", ['HttpRequestService', 
    function(httpRequest){

        return {

            findClients: function(room){
                return httpRequest.request({
                    url: serverHost + "/status/" + room
                }).then(function( response ){
                    return response.data;
                });
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
        controller: ["$log", "$routeParams", "$element", "$rootScope", "$scope", "$interval", "chatService", 
        function($log, $routeParams, $element, $rootScope, $scope, $interval, chatService){
            var $ctrl = this;
            $scope.messages = [];
            $scope.room = $routeParams.room || 'global';
            $scope.clientName = $routeParams.clientName;

            $ctrl.sendMessage = function(msg){
                msg && chat.emit('chat message', {
                    msg: msg,
                    user: $scope.clientName
                });
                $scope.message = '';
            }

            $ctrl.findClients = function(room){
                chatService.findClients(room)
                .then(function(result){
                    $scope.clients = result.clients;
                });
            }

            $rootScope.chat && $rootScope.chat.close();
            $rootScope.chat = io.connect(serverHost + '/chat');

            let chat = $rootScope.chat;

            chat.on('connect', function(msg){
                chat.emit('join room', {
                    room: $scope.room,
                    user: $scope.clientName
                });
            });
            chat.on('chat message', function(data){
                $scope.messages.push(data);
                $scope.$digest();
            });

            var stopTime = $interval(function() { $ctrl.findClients($scope.room) }, 5000);

            $log.log($element);
            // listen on DOM destroy (removal) event, and cancel the next UI update
            // to prevent updating time after the DOM element was removed.
            $element.on('$destroy', function() {
                $interval.cancel(stopTime);
            });
        }]
    });
})();