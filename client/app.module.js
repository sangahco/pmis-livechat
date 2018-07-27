(function(){
    "use strict";

    var app = angular.module("app", ['ngRoute', 'chat', 'chatManager', 'chatView', 'notification']);

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
        
        // init for top menu
        $ctrl.menu = '1';

    }]);

})();