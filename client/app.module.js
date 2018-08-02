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
        // init for top menu
        $ctrl.menu = '1';

    }]);

    app.run(function ($rootScope,$timeout) {
        $rootScope.$on('$viewContentLoaded', ()=> {
            $timeout(() => {
                componentHandler.upgradeAllRegistered();
            })
        })
    });

    app.run(function () {
        var mdlUpgradeDom = false;
        setInterval(function() {
            if (mdlUpgradeDom) {
                //console.log('upgrading dom...');
                componentHandler.upgradeDom();
                mdlUpgradeDom = false;
            }
        }, 200);
    
        var observer = new MutationObserver(function () {
            mdlUpgradeDom = true;
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        /* support <= IE 10
        angular.element(document).bind('DOMNodeInserted', function(e) {
            mdlUpgradeDom = true;
        });
        */
    });

})();