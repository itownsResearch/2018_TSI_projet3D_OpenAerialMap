// Position near Gerbier mountain.
const positionOnGlobe = { longitude: 2.351323, latitude: 48.856712, altitude: 4000};

// `viewerDiv` will contain iTowns' rendering area (`<canvas>`)
var viewerDiv = document.getElementById('viewerDiv');

// Instanciate iTowns GlobeView*
var globeView = new itowns.GlobeView(viewerDiv, positionOnGlobe, { renderer: renderer });

var promises = [];

var menuGlobe = new GuiTools('menuDiv');

menuGlobe.view = globeView;


function addLayerCb(layer) {
    return globeView.addLayer(layer);
}
// Add one imagery layer to the scene
// This layer is defined in a json file but it could be defined as a plain js
// object. See Layer* for more info.
promises.push(itowns.Fetcher.json('itowns/examples/layers/JSONLayers/Ortho.json').then(addLayerCb));
// Add two elevation layers.
// These will deform iTowns globe geometry to represent terrain elevation.
promises.push(itowns.Fetcher.json('itowns/examples/layers/JSONLayers/WORLD_DTM.json').then(addLayerCb));
promises.push(itowns.Fetcher.json('itowns/examples/layers/JSONLayers/IGN_MNT_HIGHRES.json').then(addLayerCb));

exports.view = globeView;
exports.initialPosition = positionOnGlobe;

function displayOrthos()
{
  itowns.Fetcher.json('https://api.openaerialmap.org/meta').
  then(data=>
    {
      //console.log(data);
      for (var i = 0; i < data.results.length; i++) {
        //if (i>=1) break;
        var bbox = data.results[i].bbox;
        var coords = data.results[i].geojson.coordinates[0];
        var properties = data.results[i].properties;
        //console.log(coords);
      addMeshToScene(bbox,coords,properties);
        }
    });
}

function addMeshToScene(bbox,coords,properties) {
    // creation of the new mesh (a cylinder)
    var lat1 = bbox[0];
    var long1 = bbox[1];
    var lat2 = bbox[2];
    var long2 = bbox[3];


    var bboxCoords1 = new itowns.Coordinates('EPSG:4326',lat1 , long1,0);
    var bboxCoords2 = new itowns.Coordinates('EPSG:4326',lat2 , long2,0);

    var bboxCoords1XYZ = bboxCoords1.as(globeView.referenceCrs).xyz();
    var bboxCoords2XYZ = bboxCoords2.as(globeView.referenceCrs).xyz();

    var width = Math.sqrt(Math.pow(bboxCoords1XYZ.x-bboxCoords2XYZ.x,2))
    var height = Math.sqrt(Math.pow(bboxCoords1XYZ.y-bboxCoords2XYZ.y,2))


    var THREE = itowns.THREE;

    var geometry = new THREE.PlaneGeometry(width, height, 1);
    var loader = new THREE.TextureLoader();
    //loader.crossOrigin = 'use-credentials';
    //var texture  = loader.load(properties.thumbnail);
    //var texture  = loader.load("http://www.function1.com/sites/default/files/field/image/twolocationsmap_popup_0.png");

    //var material = new THREE.MeshBasicMaterial({ map: texture,side:THREE.DoubleSide });
    var material = new THREE.MeshBasicMaterial({ color: 0xff0000,side:THREE.DoubleSide });
    var mesh = new THREE.Mesh(geometry, material);

    //console.log("COORDINATES ", coords[0][1] , coords[0][0]);

      var imCoords = new itowns.Coordinates('EPSG:4326',coords[0][0] , coords[0][1],0);
    // get the position on the globe, from the camera

      var xyz = imCoords.as('EPSG:4978').xyz();

      console.log("bbox1",bboxCoords1XYZ);
      console.log("bbox2",bboxCoords2XYZ);

    //console.log("COORDINATES CONVERTIES ", imCoords.as('EPSG:4978').xyz());
    var cameraTargetPosition = globeView.controls.getCameraTargetGeoPosition();

    // position of the mesh
    var meshCoord = imCoords;
  //  console.log("TARGET POSTION ",cameraTargetPosition);
  //  console.log("our POSTION ", imCoords);
    meshCoord.setAltitude(cameraTargetPosition.altitude()+100);

    // position and orientation of the mesh
    console.log("affiché",meshCoord.as(globeView.referenceCrs).xyz());
    mesh.position.copy(meshCoord.as(globeView.referenceCrs).xyz());
    //mesh.position.z= 30;

  //  console.log("MESH POSTION ",mesh.position);
    mesh.lookAt(new THREE.Vector3(0, 0, 0));
  //  mesh.rotateX(Math.PI / 2);

    // update coordinate of the mesh
    mesh.updateMatrixWorld();


    // add the mesh to the scene
    globeView.scene.add(mesh);

    //globeView.controls.setCameraTargetGeoPosition({longitude:coords[0][0] , latitude:coords[0][1]}, true);
    // make the object usable from outside of the function
    globeView.mesh = mesh;
}

// Listen for globe full initialisation event
globeView.addEventListener(itowns.GLOBE_VIEW_EVENTS.GLOBE_INITIALIZED, function () {
    // eslint-disable-next-line no-console
    console.info('Globe initialized');
    Promise.all(promises).then(function () {
        menuGlobe.addImageryLayersGUI(globeView.getLayers(function (l) { return l.type === 'color'; }));
        menuGlobe.addElevationLayersGUI(globeView.getLayers(function (l) { return l.type === 'elevation'; }));

        //addMeshToScene();
        displayOrthos();

        globeView.controls.setTilt(10, true);
    });
});
