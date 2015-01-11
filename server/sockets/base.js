
var request = require('request'),
    http = require('http'),
    querystring = require('querystring'),
    fieldsMiddle = require('./../fields/fields-middle.js');

var DIRECTION = {
  UP: 1,
  RIGHT: 2,
  DOWN: 3,
  LEFT: 4
};

module.exports = function (io) {
  'use strict';

  var players = [];
  var games = {};

  io.on('connection', function (socket) {
    console.log('A new connection was established.');

    var user = {};

    socket.on('disconnect', function() {
      console.log('User disconnected ' + user.username);

      // delete players[user.id];
      players = players.filter(function(player) {
        if (player.id !== user.id)
          return player;
      });

      clearTimeout(games[user.id].timeout);
      delete games[user.id];

      // Notiffy all of the users
      io.sockets.emit('broadcast', {
        type: 'player-left',
        message: user.username + ' has left.',
        players: players
      });
    });

    socket.on('register', function (player) {
      console.log(player);
      players.push(player);

      user = player;
      io.sockets.emit('broadcast', {
        type: 'player-joined',
        message: 'New playes has joined.',
        players: players
      });
    });

    socket.on('game:command', function (command) {
      console.log('Command received');
      console.log(command);

      var game = games[command.id];
      game.direction = command.direction;
    });

    socket.on('game:init', function (player) {
      console.log('Init game');

      var game = {
        field: generateField(fieldsMiddle[0].field),
        fieldType: fieldsMiddle[0].type,
        board: generateField(fieldsMiddle[0].field),
        state: 0,
        direction: DIRECTION.RIGHT
      };

      games[player.id] = game;

      io.sockets.emit('game-'+user.id, {
        type: 'init',
        game: game
      });
    });

    socket.on('game:start', function (player) {
        console.log('Start game');
        var game = games[player.id];

        game.state = 1;
        game.snake = generateSnake(game.field);

        game.timeout = setTimeout(function() {
          gameTick(game);
        }, 500);
    });

    // Utils
    function generateSnake(field) {
      var snake = [];

      var verticalMiddle = field.length/2,
          horizontalMiddle = field[0].length/2;

      snake.push({ x: 3, y: 3});
      snake.push({ x: 4, y: 3});
      snake.push({ x: 5, y: 3});

      return snake;
    }

    function generateField(field) {
      var newField = [];

      field.forEach(function(row, rowIndex) {
        newField[rowIndex] = [];
        row.forEach(function(col, colIndex) {
          newField[rowIndex][colIndex] = col;
        });
      });

      return newField;
    }

    function moveSnake(snake, direction) {
      var lastCell = snake.length;

      snake = snake.map(function(cell, index) {
        if (index === lastCell-1) {
          switch (direction) {
            case DIRECTION.UP:
              cell.y--;
              break;
            case DIRECTION.RIGHT:
              cell.x++;
              break;
            case DIRECTION.DOWN:
              cell.y++;
              break;
            case DIRECTION.LEFT:
              cell.x--;
              break;
          }
        }
        else {
          cell.x = snake[index+1].x;
          cell.y = snake[index+1].y;
        }

        return cell;
      });

      return snake;
    }

    function applySnakeToField(field, snake) {
      var board = generateField(field);
      snake.forEach(function(item) {
        if (board[item.y][item.x] === 0 || board[item.y][item.x] === -3)
          board[item.y][item.x] = -3;
        else
          board[item.y][item.x] *= -1;
      });

      return board;
    }

    function gameTick(game) {
      console.log('Game tick');
      //console.log(game);

      game.snake = moveSnake(game.snake, game.direction);
      game.board = applySnakeToField(game.field, game.snake);

      io.sockets.emit('game-'+user.id, {
        type: 'tick',
        game: game
      });

      game.timeout = setTimeout(function() {
        gameTick(game);
      }, 300);
    }

  });
};