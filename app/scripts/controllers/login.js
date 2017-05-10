'use strict';

angular.module('webtorrentClientApp')
  .controller('LoginCtrl', function ($scope, $rootScope, AUTH_EVENTS, AuthService, UserService, $location) {

    $scope.credentials = {
      email: 'moz@wp.pl',
      password: 'password'
    };

    $scope.login = function (credentials) {
      AuthService.login(credentials).then(function () {
        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
        $location.path('/');
      }, function () {
        $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
      });
    };
  });
