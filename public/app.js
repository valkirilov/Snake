'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'ngCookies',
  'ngAnimate',

  'myApp.game',
  'myApp.about',
  'myApp.version',
  'myApp.services',

  //'restangular',
  'ui.bootstrap',
  'btford.socket-io',
  'ipCookie',
  //'chieffancypants.loadingBar',
  'gettext',
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/game'});
}])
.controller('GlobalController', ['$scope', '$rootScope', '$location', 'gettextCatalog', 'gameSocket', 'ipCookie', 'nameGenerator',
  function($scope, $rootScope, $location, gettextCatalog, gameSocket, ipCookie, nameGenerator) {

  $scope.lang = "en";
  $rootScope.players = [];
  $rootScope.player = {};

  $scope.setLanguage = function(language) {
    $scope.lang = language;
    gettextCatalog.currentLanguage = language;
  };

  $scope.$on('socket:broadcast', function(event, data) {
    console.log(data);
    if (data.type === 'player-joined' || data.type === 'player-left') {
      $rootScope.players = data.players;
    }
  });

  $scope.$on('socket:'+$rootScope.player.id, function(event, data) {
    console.log('Player socket mesage received:');
    console.log(data);

    //$rootScope.players = data.players;
  });

  $scope.init = function() {
    if (ipCookie('player')) {
      $rootScope.player = ipCookie('player');
      
      console.log('Player loaded.');
      console.log($rootScope.player);
    }
    else {
      $rootScope.player = {
        id: moment().unix().toString(),
        username: nameGenerator.getName()
      };

      ipCookie('player', $rootScope.player);
      console.log('Player generated and saved.');
    }

    gameSocket.emit('register', $rootScope.player);
  };
  $scope.init();

}]);