/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

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

/***/ })
/******/ ]);