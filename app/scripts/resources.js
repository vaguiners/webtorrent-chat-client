'use strict';

var resources = angular.module('Resources', ['ngResource']);


resources.factory('DhtFactory', function ($resource, ENDPOINT_URI) {
  return $resource(ENDPOINT_URI + 'dht/:dhtId', {dhtId:'@_id'},
    {
      'update': { method:'PUT' }
    });
});

// todo rename to FriendsFactory
resources.factory('UsersFactory', function ($resource, ENDPOINT_URI) {
  return $resource(ENDPOINT_URI + 'users');
});

