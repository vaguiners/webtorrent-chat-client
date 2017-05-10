'use strict';

/**
 * @ngdoc overview
 * @name webtorrentClientApp
 * @description
 * # webtorrentClientApp
 *
 * Main module of the application.
 */
angular
  .module('webtorrentClientApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'Services', // data holders
    'Resources', // all ngResources
    'AuthServices', // resources for auth
    'Torrents', // torrent services
    'luegg.directives', // angular-scroll-glue - scrolling discussion div to bottom on change
    'LocalForageModule', // for async storage api including indexedDB
    'LocalStorageModule', // for sync storage like currentUser
    'ngLodash',
    'file-model' // input[file]
  ])
  .constant('ENDPOINT_URI', 'http://192.168.1.5:5000/')
  // .constant('ENDPOINT_URI', 'http://192.168.43.156:5000/')
  .constant('USER_ROLES', {
    all: '*',
    admin: 'admin',
    user: 'user',
    guest: 'guest'
  })
  .constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
  })
  .config(function ($routeProvider, localStorageServiceProvider, USER_ROLES) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main',
        data: {
          authorizedRoles: [USER_ROLES.all]
        }
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about',
        data: {
          authorizedRoles: [USER_ROLES.all]
        }
      })
      .when('/messenger', {
        templateUrl: 'views/messenger.html',
        controller: 'MessengerCtrl',
        controllerAs: 'messenger',
        data: {
          authorizedRoles: [USER_ROLES.admin, USER_ROLES.user]
        }
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl',
        data: {
          authorizedRoles: [USER_ROLES.all]
        }
      })
      .otherwise({
        redirectTo: '/'
      });

    localStorageServiceProvider
      .setPrefix('webtorrentClientApp')
      .setStorageType('localStorage')
      .setNotify(true, true);
  })
  .run(function ($rootScope, AUTH_EVENTS, AuthService) {
    $rootScope.$on('$routeChangeStart', function (event, next) {
      var authorizedRoles = !!next && next.data ? next.data.authorizedRoles : null;
      if (!authorizedRoles) {
        event.preventDefault();
        return;
      }
      if (authorizedRoles.indexOf('*') === -1 && !AuthService.isAuthorized(authorizedRoles)) {
        event.preventDefault();
        if (AuthService.isAuthenticated()) {
          // user is not allowed
          $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
        } else {
          // user is not logged in
          $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
        }
      }
    });
  });
