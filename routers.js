/**
 * Created by Shimon on 07/10/2015.
 */
var express = require('express');
var routers = express.Router();
var fs = require('fs');

//routers.get('/', function(req, res){
//    res.render('index', {
//    });
//});

routers.get('/apartment', function(req, res){
    var apartments = require('./apartments.json');
    res.send(JSON.stringify(apartments));
});

routers.get('/apartments-list', function(req, res){
    var apartments = require('./apartments.json');
    apartments = apartments.items;
    for(var i = 0 in apartments){
        var image = {};
        for(var j = 0 in apartments[i].images){
            if(apartments[i].images[j].active){
                apartments[i].image = apartments[i].images[j].path;
                break;
            }
        }
        delete apartments[i].images;
        delete apartments[i].schedule;
        delete apartments[i].specs;
    }
    res.send(apartments);
});



module.exports = routers;