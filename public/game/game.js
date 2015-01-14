'use strict';

var DIRECTION = {
	UP: 1,
	RIGHT: 2,
	DOWN: 3,
	LEFT: 4
};

angular.module('myApp.game', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/game', {
    templateUrl: 'game/game.html',
    controller: 'GameCtrl'
  });
}])

.controller('GameCtrl', ['$rootScope', '$scope', '$document', 'gameSocket', function($rootScope, $scope, $document, gameSocket) {

	$scope.game = {};

	$scope.keyUp = function($event) {
		var command = {
			direction: null,
			id: $rootScope.player.id
		};

		switch($event.keyCode) {
			case 37: // left;
				command.direction = DIRECTION.LEFT;
				break;
			case 38: // up;
				command.direction = DIRECTION.UP;
				break;
			case 39: // right;
				command.direction = DIRECTION.RIGHT;
				break;
			case 40: // down;
				command.direction = DIRECTION.DOWN;
				break;
		}

		if (command.direction !== null) {
			gameSocket.emit('game:command', command);
		}
	};

	$scope.start = function() {
		gameSocket.emit('game:init', { id: $rootScope.player.id });
	};

	gameSocket.on('game-'+$rootScope.player.id, function(data) {
		console.log(data.type + " status: " + data.status + " message: " + data.message);
		$scope.game = data.game;

		if (data.type === 'init') {
			gameSocket.emit('game:start', { id: $rootScope.player.id });
		}

		if (!data.status) {
			alert('Game end!');
		}

	});

	$scope.init = function() {

		$document.bind("keyup", function(event) {
        	$scope.keyUp(event);
    	});

    	gameSocket.emit('game:init', { id: $rootScope.player.id });
	};
	$scope.init();




}]);