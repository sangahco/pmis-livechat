(function(){
    "use strict";

    var app = angular.module("app", ['ngRoute', 'chat', 'chatManager', 'chatView', 'notification']);

    app.directive('preventDefault', function() {
        return {
            restrict: 'A',
            link: function(scope, elem, attrs) {
                elem.on('click', function(e){
                    e.preventDefault();
                });
            }
       };
    }); 

    app.config(['$locationProvider', '$routeProvider',
        function config($locationProvider, $routeProvider) {
        $locationProvider.hashPrefix('!');

        $routeProvider.
            when('/', {
                template: '<chat-manager></chat-manager>'
            }).
            when('/chat/:room', {
                template: '<chat-manager></chat-manager>'
            }).
            when('/chat/:room/user/:clientName', {
                template: '<chat-manager></chat-manager>'
            }).
            when('/user/:clientName', {
                template: '<chat-manager></chat-manager>'
            }).
            when('/user/:clientName/chat/:room', {
                template: '<chat-manager></chat-manager>'
            }).
            otherwise('/');
        }
    ]);
    
    app.controller("AppController", ['$log', function($log){
        var $ctrl = this;

        $ctrl.applicationName = 'PMIS Live Chat';
    }]);

})();