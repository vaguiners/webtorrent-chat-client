'use strict';

var services = angular.module('Services', []);

services.factory('MessagesFactory', function($localForage, $q, lodash){
  var messages = {};

  messages.my = [[], [], [], [], [], [], []];
  messages.control = [[], [], [], [], [], [], []];
  messages.other = [];
  messages.otherControl = [];

  function logn(base, val) {
    return Math.log(val) / Math.log(base);
  }

  messages.getLevelFromLength = function(len) {
    return Math.floor(logn(5, len));
  };

  messages.numberOfMessagesForLevel = function (level) {
    return Math.pow(5, level+1);
  };

  function pushMessage(userDhtId, infoHash, message, level) {
    if (message.type === 'control' && userDhtId === message.sender) {
      var levelCounted = messages.getLevelFromLength(message.content.infoHashes.length); // count level based on number of regular messages it contains
      messages.control[levelCounted].push({infoHash: infoHash, message: message});
    } else if (message.type === 'control') {
      messages.otherControl.push({infoHash: infoHash, message: message});
    } else if (userDhtId === message.sender) {
      level = level || 0;
      messages.my[level].push({infoHash: infoHash, message: message});
    } else {
      messages.other.push({infoHash: infoHash, message: message});
    }
  }

  messages.init = function (userDhtId) {
    return $q(function(resolve) {
      $localForage.iterate(function(value, key) {
        pushMessage(userDhtId, key, value);
      }).then(function () {
        resolve();
      });
    });
  };

  messages.add = function(infoHash, message, userDhtId, level) {
    pushMessage(userDhtId, infoHash, message, level);
    $localForage.setItem(infoHash, message);
  };

  messages.moveLevelUp = function (level) {
    messages.my[level+1] = lodash.concat(messages.my[level+1], messages.my[level]);
    messages.my[level] = [];
  };

  messages.removeControlMessagesFromLevel = function (level) {
    $localForage.removeItem(lodash.map(messages.control[level], 'infoHash'));
    messages.control[level] = [];
  };

  messages.removeControlMessagesByInfoHash = function (infoHashes) {
    function compare(i, j) {
      return i.infoHash === j;
    }
    lodash.pullAllWith(messages.otherControl, infoHashes, compare);
    lodash.forEach(messages.control, function (sublist) {
      lodash.pullAllWith(sublist, infoHashes, compare);
    });
    $localForage.removeItem(infoHashes);
  };

  messages.getMessagesByInfoHash = function (list, infoHashes, level) {
    level = level || 0;
    var messagesFromList = lodash.filter(list[level], function(item) {
      return lodash.includes(infoHashes, item.infoHash);
    });
    return messagesFromList;
  };

  messages.changeLevelForMessages = function (list, fromLevel, toLevel, listOfMessagesToMove) {
    lodash.pullAll(list[fromLevel], listOfMessagesToMove);
    list[toLevel] = lodash.concat(list[toLevel], listOfMessagesToMove);
  };

  messages.getAll = function () {
    return lodash.concat(lodash.flatten(messages.my), messages.other);
  };

  return messages;
});




services.directive("ngFileSelect",function(){

  return {
    link: function($scope,el){

      el.bind("change", function(e){

        $scope.file = (e.srcElement || e.target).files[0];
        $scope.getFile();
      })

    }

  }


})
