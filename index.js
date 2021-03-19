var express = require('express');
var app = express();
var multer = require('multer');
var upload = multer();
var bodyParser = require('body-parser');
const elasticsearch = require("elasticsearch")
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


//Version avec leasticsearch
app.listen(process.env.PORT || 3000, () => {
    console.log("connected")
});
const esClient = elasticsearch.Client({
    host: "http://127.0.0.1:9200",
});



/** version avec une BDD mongo
MongoClient.connect("mongodb://localhost:27017/geo", function(err, db) {
 console.log("Connected correctly to server");

 mydb = db;
 app.listen(3000);
 console.log("Server listening...");
});
*/

app.get('/geo-search', function(req, res){
   res.render('form');
});

//Version avec BDD elastic search
app.get("/products", (req, res) => {
  var latitude = parseFloat(req.query.latitude);
  var longitude = parseFloat(req.query.longitude);
  var radius = parseFloat(req.query.Radius);
  var titre = req.query.titre;

    esClient.search({
        index: "equi", //nom de la base
        body: {
            query: {
              "bool": {
                "must": {
                  "match_all": {}
                },
                "filter": {
                  "geo_distance": {
                  "distance": radius+"km",
                  "coordinates": [
                    longitude,
                    latitude
                  ]
                }
                }

              }
            }
        }
    })
    .then(response => {
        res.render('geo-search-results',{
          results : response.hits.hits.map(function(hit){
            return { "properties" : hit._source ,"geometry":{ "coordinates" : hit._source.coordinates } }
          })
        })
    })
    .catch(err => {
        return res.status(500).json({"message": "Error"})
    })
});

//VErsion BDD avec mongo
app.get('/geo-search-results', function(req, res){

   var latitude = parseFloat(req.query.latitude);
   var longitude = parseFloat(req.query.longitude);
   var radius = parseFloat(req.query.Radius);
   var titre = req.query.titre;


   var filter = {"properties.ins_nom": {$regex : ".*"+titre+".*", $options : "i"}};
   filter.geometry = { "$geoWithin": { "$center": [ [ longitude ,latitude] , radius ] } };


    mydb.collection('equip').find(filter).toArray(function(err, docs) {
       console.log("Found "+docs.length+" records");
       res.render('geo-search-results', {
         results: docs, latitude :latitude, longitude:longitude, radius : radius, titre: titre
       });
     });

});


//VERSION POUR SORTIR UN JSON --> sert au fichier map.js pour afficher la carte
app.get('/geo-search-results-json', function(req, res){

   var latitude = parseFloat(req.query.latitude);
   var longitude = parseFloat(req.query.longitude);
   var radius = parseFloat(req.query.Radius);
   var titre = req.query.titre;

   var filter = {"properties.ins_nom": {$regex : ".*"+titre+".*", $options : "i"}};
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
