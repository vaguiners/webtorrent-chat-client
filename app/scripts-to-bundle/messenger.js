'use strict';

angular.module('webtorrentClientApp')
  .controller('MessengerCtrl', function ($scope, $interval, $timeout, DhtFactory, UsersFactory, MessagesFactory, TorrentFactory, lodash, fileReader) {

    var clearVariables = function () {
      $scope.fileInput = {};
      $scope.my = MessagesFactory.my;
      $scope.con = MessagesFactory.control;
      $scope.otherControl = MessagesFactory.otherControl;
      $scope.ot = MessagesFactory.other;
      $scope.textInput = '';
      $scope.getConversation = MessagesFactory.getAll; // factory with messages
      $scope.getTorrents = TorrentFactory.getAllTorrents;
      $scope.friends = []; // TODO pobrać z service'u o userze lub w ogóle w nim trzymać tylko
      $scope.myDhtId = $scope.currentUser.dhtId; // TODO per conversation; to tylko dla danej konwersacji; pobierane z serwera razem z moim profilem
    };

    var getUsers = function () {
      UsersFactory.get({}, function (data) {
        $scope.friends = data._items;
      });
    };

    var initController = function () {
      clearVariables();
      getUsers();
      TorrentFactory.init($scope.currentUser.dhtId);

      var uploadElement = require('upload-element');

      var upload = document.querySelector('input[name=upload]')
      if (upload) {
        uploadElement(upload, function (err, files) {
          if (err) {
            return console.error(err);
          }
          files = files.map(function (file) { return file.file })
          onFiles(files)
        })
      }
    };

    $scope.checkMessages = function () {
      TorrentFactory.checkMessages();
    };

    $scope.sendMessage = function () {
      TorrentFactory.sendMessage($scope.textInput);
    };



    function isTorrentFile (file) {
      var extname = path.extname(file.name).toLowerCase()
      return extname === '.torrent'
    }

    function isNotTorrentFile (file) {
      return !isTorrentFile(file)
    }
    // todo z uzyciem uploadElement
    function onFiles (files) {
      console.log('got files:')
      files.forEach(function (file) {
        console.log(' - %s (%s bytes)', file.name, file.size)
      })

      // .torrent file = start downloading the torrent
      // files.filter(isTorrentFile).forEach(downloadTorrentFile)

      // everything else = seed these files
      // seed(files.filter(isNotTorrentFile))
      TorrentFactory.sendPicture(files)
    }



    // todo nasluchiwanie na submit
    document.querySelector('.send-file-form').addEventListener('submit', function (e) {
      e.preventDefault() // Prevent page refresh

      console.log('inside submit')
      var torrentId = document.querySelector('form input[id=fileInputId]').value
      // console.log('Adding ' + torrentId)
      // client.seed(torrentId)
    })

    //document.getElementById('input').files[0]





    //todo zwykla lista i onchange
    $scope.handleFiles = function (filesLst) {
      //console.log(filesLst)
      TorrentFactory.sendPicture(filesLst)
    }




    // todo filereader
    $scope.getFile = function () {
      $scope.progress = 0;
      fileReader.readAsArrayBuffer($scope.file, $scope)
        .then(function(result) {
          //console.log(result)
          // TorrentFactory.sendPicture(angular.element('#fileInputId').files[0])
          TorrentFactory.sendPicture(result)



          //$scope.imageSrc = result;
        });
    };
    $scope.$on("fileProgress", function(e, progress) {
      $scope.progress = progress.loaded / progress.total;
    });







    // todo file input z directive
    $scope.sendFile = function () {
      $timeout(function () {
        console.log($scope.fileInput.pictureInput)
        TorrentFactory.sendPicture($scope.fileInput.pictureInput)
        //$scope.fileInput.pictureInput = undefined;
        //angular.element('#fileInputId').val(null);
      }, 1);
    };







    $scope.truncate = function (word) {
      return lodash.truncate(word, {'length': 8});
    };

    var checkMessagesInterval = $interval(function() {
      $scope.checkMessages();
    }, 5000);

    var refreshConversationInterval = $interval(function() {
      // todo to jest hack, wymusza digest co sekundę...
      // TODO naprawić, żeby wiadomości z poprzedniego sprawdzenia wyswietlały się od razu jak są dostępne,
      // todo a nie kiedy skończy się kolejny cykl sprawdzenia
      // todo ale żeby nie wyswietlały się nowsze jeśli jeszcze nie ma poprzednich (FIFO)
    }, 1000);

    $scope.$on('$destroy', function() {
      $interval.cancel(checkMessagesInterval);
      checkMessagesInterval = undefined;
      $interval.cancel(refreshConversationInterval);
      refreshConversationInterval = undefined;
    });

    initController(); // init variables and get all data from server
  });
