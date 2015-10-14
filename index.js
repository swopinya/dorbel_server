/**
 * Created by Shimon on 07/10/2015.
 */
var express = require("express");
var app = express();
var server = require('http').createServer(app);
var path = require('path');
var bodyParser = require('body-parser');

//app.set('view engine', 'ejs');
//app.set('views', path.join(__dirname, 'views'));

// use middleware
//app.use(express.static(path.join(__dirname, 'views')));
//app.use(bodyParser.urlencoded({ extended: false }));

// define routes
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
    next();
});

app.use(require('./routers'));

var port = process.env.PORT || 3000;
server.listen(port, function(){
    console.log("app http ready on port "+port);
});