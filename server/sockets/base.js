
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
        game: game,
        status: true
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

    function moveSnake(snake, direction, field) {
      var lastCell = snake.length;
      var result = {};

      // Check for the collision of the first element
      var snakeHead = {
        x: snake[lastCell-1].x,
        y: snake[lastCell-1].y
      },
          isEating = false;

      switch (direction) {
        case DIRECTION.UP:
          snakeHead.y--;
          break;
        case DIRECTION.RIGHT:
          snakeHead.x++;
          break;
        case DIRECTION.DOWN:
          snakeHead.y++;
          break;
        case DIRECTION.LEFT:
          snakeHead.x--;
          break;
      }

      if (field[snakeHead.y][snakeHead.x] === 2) {
        result.message = "Eating";
        field[snakeHead.y][snakeHead.x] = 0;
        snake.push(snakeHead);
        field = generateFood(field, snake);
        isEating = true;
      }
      else if (field[snakeHead.y][snakeHead.x] === 1) {
        result.message = "Wall";
        
        // Not sure for the multyplayer
        result.status = false;
        return result;
      }
      else {
        result.message = "Free cell";
      }

      if (!isEating) {
        snake = snake.map(function(cell, index) {
          if (index === lastCell-1) {
            cell = snakeHead;
          }
          else {
            cell.x = snake[index+1].x;
            cell.y = snake[index+1].y;
          }
          return cell;
        });
      }

      result.snake = snake;
      result.field = field;
      result.status = true;

      return result;
    }

    function applySnakeToField(field, snake) {
      var result = {};
      var board = generateField(field);
      result.status = true;
      snake.forEach(function(item) {
        
        if (board[item.y][item.x] === 0) {
          board[item.y][item.x] = -3;
        }
        else if (board[item.y][item.x] === -3) {
          result.status = false;
          return result;
        }
        else {
          board[item.y][item.x] *= -1;
        }
      });

      result.board = board;

      return result;
    }

    function generateFood(field, snake) {
      var isNotEmptyField = true,
          x, 
          y;

      while(isNotEmptyField) {
        isNotEmptyField = true;
        y = generateRandom(field.length);
        x = generateRandom(field[0].length);

        if (field[y][x] === 0) {
          snake.forEach(function(item) {
            if (item.x != x && item.y != y) {
              isNotEmptyField = false;
            }
          });
        }
      }

      field[y][x] = 2;
      return field;
    }

    function gameTick(game) {
      console.log('Game tick');
      //console.log(game);
      var status = true;

      var move = moveSnake(game.snake, game.direction, game.field);
      status = move.status;
      if (!move.status) {
        // Game end
      }
      else {
        game.snake = move.snake;
        game.field = move.field;

        var boardWithSnake = applySnakeToField(game.field, game.snake);
        if (!boardWithSnake.status) {
          status = false;
        }
        else {
          game.board = boardWithSnake.board;  
        }
      }

      io.sockets.emit('game-'+user.id, {
        type: 'tick',
        game: game,
        status: status,
        message: move.message
      });

      if (status) {
        game.timeout = setTimeout(function() {
          gameTick(game);
        }, 100);
      }
    }

    function generateRandom(max) {
      return Math.floor(Math.random()*max);
    }

  });
};