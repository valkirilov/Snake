'use strict';

angular.module('myApp.services.game-socket', [])
.factory('gameSocket', function (socketFactory) {
  var socket = socketFactory();
  
  socket.forward('broadcast');
  socket.forward('user');
  //socket.forward('game');
  
  return socket;
});