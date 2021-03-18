var express = require('express');
var app = express();
var multer = require('multer');
var upload = multer();
var bodyParser = require('body-parser');
var mydb;
var MongoClient = require('mongodb').MongoClient;


//To parse URL encoded data
app.use(bodyParser.urlencoded({ extended: false }))

//To parse json data
app.use(bodyParser.json())

app.use('/static', express.static('public')); //autorise à utiliser les static file

app.set('view engine', 'pug');
app.set('views','./views');

// for parsing application/json
app.use(bodyParser.json());

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/geo-search', function(req, res){
   res.render('form');
});


MongoClient.connect("mongodb://localhost:27017/geo", function(err, db) {
 console.log("Connected correctly to server");

 mydb = db;
 app.listen(3000);
 console.log("Server listening...");
});


app.get('/geo-search-results', function(req, res){
   //console.log(req.query); // retourne les infos rentrées par l'utilisateur

   var latitude = parseFloat(req.query.latitude);
   var longitude = parseFloat(req.query.longitude);
   var radius = parseFloat(req.query.Radius);

   var filter = {};
   filter.geometry = { "$geoWithin": { "$center": [ [ longitude ,latitude] , radius ] } };

    mydb.collection('equip').find(filter).toArray(function(err, docs) {
       console.log("Found "+docs.length+" records");
       res.render('geo-search-results', {
         results: docs
       });
     });

});


app.get('/geo-search-results-json', function(req, res){

   var latitude = parseFloat(req.query.latitude);
   var longitude = parseFloat(req.query.longitude);
   var radius = parseFloat(req.query.Radius);

   var filter = {};
    filter.geometry = { "$geoWithin": { "$center": [ [ longitude ,latitude] , radius ] } };

    console.log("filter", JSON.stringify(filter));

    mydb.collection('equip').find(filter).toArray(function(err, docs) {
       console.log("Found "+docs.length+" records");

       res.set('Content-Type', 'application/json; charset utf-8');
       res.end(JSON.stringify(
         {
           "type": "FeatureCollection",
           "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
           "features": docs
         }));
     });
});
