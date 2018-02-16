var container;
var renderer,camera, projector;

var viewWidth = window.innerWidth;
var viewHeight = window.innerHeight;
var cameraOffset = window.innerWidth;
var objectsLists = [];
// Position near Gerbier mountain.



const positionOnGlobe = { longitude: 2.351323, latitude: 48.856712, altitude: 400000};

// `viewerDiv` will contain iTowns' rendering area (`<canvas>`)
var viewerDiv = document.getElementById('viewerDiv');
// Instanciate iTowns GlobeView*
var globeView = new itowns.GlobeView(viewerDiv, positionOnGlobe, renderer);


camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );


var camLocation =  globeView.controls.getCameraLocation();
var xyz = camLocation.as(globeView.referenceCrs).xyz();
camera.position.x = xyz.x ;
camera.position.y = xyz.y;
camera.position.z = xyz.z;

console.log(globeView);
//globeView.scene.add(camera);
camera.lookAt(globeView.scene.position);
var promises = [];

var menuGlobe = new GuiTools('menuDiv');

menuGlobe.view = globeView;


function addLayerCb(layer) {
    return globeView.addLayer(layer);
}
// Add one imagery layer to the scene
// This layer is defined in a json file but it could be defined as a plain js
// object. See Layer* for more info.
promises.push(itowns.Fetcher.json('node_modules/itowns/examples/layers/JSONLayers/Ortho.json').then(addLayerCb));
// Add two elevation layers.
// These will deform iTowns globe geometry to represent terrain elevation.
promises.push(itowns.Fetcher.json('node_modules/itowns/examples/layers/JSONLayers/WORLD_DTM.json').then(addLayerCb));
promises.push(itowns.Fetcher.json('node_modules/itowns/examples/layers/JSONLayers/IGN_MNT_HIGHRES.json').then(addLayerCb));

exports.view = globeView;
exports.initialPosition = positionOnGlobe;

function displayOrthos()
{
  itowns.Fetcher.json('https://api.openaerialmap.org/meta').
  then(data=>
    {
      for (var i = 0; i < data.results.length; i++)
      {
        var bbox = data.results[i].bbox;
        var coords = data.results[i].geojson.coordinates[0];
        var properties = data.results[i].properties;
        addMeshToScene(bbox,coords,properties);
      }
          render();
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

    var texture  = loader.load(properties.thumbnail);
    var material = new THREE.MeshBasicMaterial({ map: texture,side:THREE.DoubleSide });
    //var material = new THREE.MeshBasicMaterial({ color: 0xff0000,side:THREE.DoubleSide });
    var mesh = new THREE.Mesh(geometry, material);

    var imCoords = new itowns.Coordinates('EPSG:4326',coords[0][0] , coords[0][1],0);
    // get the position on the globe, from the camera

    var xyz = imCoords.as('EPSG:4978').xyz();

    var cameraTargetPosition = globeView.controls.getCameraTargetGeoPosition();

    // position of the mesh
    var meshCoord = imCoords;
    meshCoord.setAltitude(cameraTargetPosition.altitude()+100000);

    // position and orientation of the mesh
    mesh.position.copy(meshCoord.as(globeView.referenceCrs).xyz());

    mesh.lookAt(new THREE.Vector3(0, 0, 0));

    // update coordinate of the mesh
    mesh.updateMatrixWorld();


    // add the mesh to the scene
    globeView.scene.add(mesh);

    objectsLists.push(mesh);

    globeView.controls.setCameraTargetGeoPosition({longitude:-74.70703125, latitude:19.775390624999996}, true);

    // make the object usable from outside of the function
    //globeView.mesh = mesh;
}

var mouse = new THREE.Vector2();

function onDocumentMouseDown( event ) {

    //event.preventDefault();

    mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

    console.log(mouse.x,mouse.y);
    var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
    projector.unprojectVector( vector, camera );
    var ray = new THREE.Raycaster( camera.position, camera.position.sub( vector ).normalize() );

    var intersects = ray.intersectObjects( objectsLists );

    console.log("Camera Position ", camera.position);
    console.log("Globe camera position", globeView.controls.getCameraLocation());
    console.log("Globe norm", camera.position.sub( vector ).normalize());
    console.log("Globe", camera.position.sub( vector ).normalize());
    console.log("intersects list", intersects );
    //chromium-browser --disable-web-security --user-data-dir

    // Change color if hit block
    if ( intersects.length > 0 )
    {
        intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
    }
    render();
}

function render()
{
  renderer.render( globeView.scene, camera );
}

// Listen for globe full initialisation event
globeView.addEventListener(itowns.GLOBE_VIEW_EVENTS.GLOBE_INITIALIZED, function () {
    // eslint-disable-next-line no-console
    console.info('Globe initialized');
    Promise.all(promises).then(function () {
        menuGlobe.addImageryLayersGUI(globeView.getLayers(function (l) { return l.type === 'color'; }));
        menuGlobe.addElevationLayersGUI(globeView.getLayers(function (l) { return l.type === 'elevation'; }));

        renderer = new THREE.CanvasRenderer();
      	renderer.setSize( viewWidth, viewHeight );
      	renderer.domElement = $("#viewerDiv").children()[0];
        $("#viewerDiv").children()[0].replaceWith(renderer.domElement );
        renderer.setClearColor( 0xffffff );


      //  renderer.domElement.onclick = function(e){alert("helloe")};
        displayOrthos();

        projector = new THREE.Projector();


        document.addEventListener( 'mousedown', onDocumentMouseDown, false );


        camera.lookAt(new THREE.Vector3(0,0,0));
        render();

        globeView.controls.setTilt(10, true);
    });
});
