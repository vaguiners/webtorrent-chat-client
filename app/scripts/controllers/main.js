'use strict';

/**
 * @ngdoc function
 * @name webtorrentClientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the webtorrentClientApp
 */
angular.module('webtorrentClientApp')
  .controller('MainCtrl', function ($scope, $rootScope, USER_ROLES, AUTH_EVENTS, AuthService, UserService, $location) {
    $scope.currentUser = {};

    $scope.isAuthenticated = function() {
      return AuthService.isAuthenticated();
    };

    var init = function() {
      $scope.currentUser = UserService.getCurrentUser();
    };

    $rootScope.$on(AUTH_EVENTS.loginSuccess, function() {
      $scope.currentUser = UserService.getCurrentUser();
    });

    $rootScope.$on(AUTH_EVENTS.notAuthenticated, function() {
      $scope.currentUser = UserService.deleteCurrentUser();
      $location.path('/login');
    });

    $scope.logoutClick = function () {
      $scope.currentUser = AuthService.logout();
      $location.path('/');
    };

    init();

  });
