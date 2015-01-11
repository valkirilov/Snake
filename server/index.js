var express = require('express'),
    path = require('path'),
    io = require('socket.io'),
    http = require('http'),
    app = express(),
    server = http.createServer(app),
    io = io.listen(server),
    bodyParser = require('body-parser');

var port = process.env.PORT || 9999;

setup_express();

function setup_express() {
    app.use(bodyParser.json());
    app.use(express.static(path.join(__dirname, '../public')));

    require('./sockets/base')(io);
}

module.exports = server;