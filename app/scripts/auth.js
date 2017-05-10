'use strict';

var authServices = angular.module('AuthServices', ['ngResource']);

authServices.config(function ($httpProvider) {
  $httpProvider.interceptors.push([
    '$injector',
    function ($injector) {
      return $injector.get('AuthInterceptor');
    }
  ]);
});

authServices.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS, UserService) {
  return {
    request : function(config) {
      var currentUser = UserService.getCurrentUser(),
        auth = currentUser ? currentUser.auth : null;

      if (auth) {
        config.headers.authorization = auth;
      }
      return config;
    },

    responseError: function (response) {
      $rootScope.$broadcast({
        401: AUTH_EVENTS.notAuthenticated,
        403: AUTH_EVENTS.notAuthorized,
        419: AUTH_EVENTS.sessionTimeout,
        440: AUTH_EVENTS.sessionTimeout
      }[response.status], response);
      return $q.reject(response);
    }
  };
});

authServices.factory('AuthService', function ($http, UserService, localStorageService, ENDPOINT_URI) {
  var authService = {};

  authService.login = function (credentials) {
    return $http
      .post(ENDPOINT_URI + 'login', credentials)
      .then(function (res) {
        return UserService.setCurrentUser(res.data);
      });
  };

  authService.isAuthenticated = function () {
    return !!UserService.getCurrentUser();
  };

  authService.isAuthorized = function (authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }
    return (authService.isAuthenticated() &&
    authorizedRoles.indexOf(UserService.getCurrentUser().role) !== -1);
  };

  authService.logout = function () {
    return UserService.deleteCurrentUser();
  };

  authService.init = function () {
    return UserService.getCurrentUser();
  };

  return authService;
});

authServices.service('UserService', function(localStorageService) {
  var service = this;
  var currentUser = null;

  service.deleteCurrentUser = function () {
    currentUser = null;
    localStorageService.remove('user');
    return currentUser;
  };

  service.setCurrentUser = function(user) {
    currentUser = user;
    localStorageService.set('user', user);
    return currentUser;
  };

  service.getCurrentUser = function() {
    if (!currentUser) {
      currentUser = localStorageService.get('user');
    }
    return currentUser;
  };
});

// authServices.service('Session', function () {
//   this.putEtag = function (etag) {
//     this.etag = etag;
//   };
//   this.removeEtag = function () {
//     this.etag = null;
//   };
//   this.create = function (userId, username, userAuth, userRole) {
//     this.userId = userId;
//     this.username = username;
//     this.userAuth = userAuth;
//     this.userRole = userRole;
//   };
//   this.destroy = function () {
//     this.userId = null;
//     this.username = null;
//     this.userAuth = null;
//     this.userRole = null;
//   };
// });
//
