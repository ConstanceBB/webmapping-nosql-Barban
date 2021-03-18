/**
 * Elements that make up the popup.
 */
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

//Mise à jour du formulaire avec les valeurs demandées par l'utilisateur
var str = window.location.search;
var mySubString = str.split( "=");

/**
 * Create an overlay to anchor the popup to the map.
 */
var overlay = new ol.Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250,
  },
});

/**
 * Create a vector layer with the result of the requete
 */
var coucheEquipement = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: 'geo-search-results-json' + window.location.search,
    format: new ol.format.GeoJSON()
  }),
  style: new ol.style.Style({
    image: new ol.style.Circle({
      radius:10,
      stroke: new ol.style.Stroke({
        color: 'red',
        width: 4
      }),
      fill: new ol.style.Fill({
        color: 'olive'
      })
    })
    })

  });

/**
* Create a map with layers
*/
var map = new ol.Map({
 target: 'map',
 overlays: [overlay],
 layers: [
   new ol.layer.Tile({
     source: new ol.source.OSM(),
     opacity: 1
   }),
   coucheEquipement],
   view: new ol.View({
     center: ol.proj.fromLonLat([parseFloat(mySubString[2].replace( /[^\d\.]*/g, '')), parseFloat(mySubString[1].replace( /[^\d\.]*/g, ''))]),
     zoom: 12,
     maxZoom: 20,
   }),


});


/**
 * Add a click handler to the map to render the popup.
 */
map.on('singleclick', function (evt) {
  var coordinate = evt.coordinate;
  var hdms = ol.coordinate.toStringHDMS(ol.proj.toLonLat(coordinate));
  content.innerHTML = '<p>You clicked here:</p><code>' + hdms + '</code>';
  overlay.setPosition(coordinate);
});

/**
 * Add a click handler to hide the popup.
 * @return {boolean} Don't follow the href.
*/
closer.onclick = function () {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};

var boutton = document.getElementById("formulaireDiv").children[1].lastChild;

function centrageCarte(){
  //Modification des coordonnées du formulaire pour matcher le centre de la carte
  var coord = ol.proj.toLonLat(map.getView().getCenter());
  document.getElementById("formulaireDiv").children[1][0].value = coord[1];
  document.getElementById("formulaireDiv").children[1][1].value = coord[0];
  //Modification de la valeur du radius selon l'échelle de la centrageCarte
  console.log(map.getView().getZoom());
  document.getElementById("formulaireDiv").children[1][2].value = 0.095-map.getView().getZoom()*0.005;
};

boutton.onclick = centrageCarte;
