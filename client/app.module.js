(function(){
    "use strict";

    var app = angular.module("app", ['ngRoute', 'chat', 'chatView', 'notification']);

    app.config(['$locationProvider', '$routeProvider',
        function config($locationProvider, $routeProvider) {
        $locationProvider.hashPrefix('!');

        $routeProvider.
            when('/', {
                template: '<chat></chat>'
            }).
            when('/chat/:room', {
                template: '<chat></chat>'
            }).
            when('/chat/:room/user/:clientName', {
                template: '<chat></chat>'
            }).
            when('/user/:clientName', {
                template: '<chat></chat>'
            }).
            when('/user/:clientName/chat/:room', {
                template: '<chat></chat>'
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