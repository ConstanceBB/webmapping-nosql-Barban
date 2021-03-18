var MongoClient = require('mongodb').MongoClient;

MongoClient.connect("mongodb://localhost:27017/geo", function(err, db) {
 console.log("Connected correctly to server");

 db.collection('equip')
   .find({geometry: { "$geoWithin": { $center: [ [ 2.344, 48.86 ] , 0.003 ] } } })
   .toArray(function(err, docs) {
     console.log("Found "+docs.length+" records:");
     console.dir(docs);
     db.close();
   });
});
