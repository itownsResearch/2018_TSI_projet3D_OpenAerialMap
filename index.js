var container;
var renderer, projector;
var idNum = 0;
var viewWidth = window.innerWidth;
var viewHeight = window.innerHeight;
var cameraOffset = window.innerWidth;
var objectsLists = [];

// Position near Gerbier mountain.
var ray, mouse;


const positionOnGlobe = { longitude: 0, latitude: 0, altitude: 4005000};

// `viewerDiv` will contain iTowns' rendering area (`<canvas>`)
var viewerDiv = document.getElementById('viewerDiv');
// Instanciate iTowns GlobeView*
var globeView = new itowns.GlobeView(viewerDiv, positionOnGlobe, renderer);

var promises = [];

var menuGlobe = new GuiTools('menuDiv');

menuGlobe.view = globeView;


function addLayerCb(layer) {

    return globeView.addLayer(layer);
}
// Add one imagery layer to the scene
// This layer is defined in a json file but it could be defined as a plain js
// object. See Layer* for more info.
promises.push(itowns.Fetcher.json('https://www.itowns-project.org/itowns/examples/layers/JSONLayers/Ortho.json').then(addLayerCb));
// Add two elevation layers.
// These will deform iTowns globe geometry to represent terrain elevation.
promises.push(itowns.Fetcher.json('https://www.itowns-project.org/itowns/examples/layers/JSONLayers/WORLD_DTM.json').then(addLayerCb));
promises.push(itowns.Fetcher.json('https://www.itowns-project.org/itowns/examples/layers/JSONLayers/IGN_MNT_HIGHRES.json').then(addLayerCb));

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

        addMeshToScene(bbox,coords,properties,data.results[i].title);
      }
    });
}

function addMeshToScene(bbox,coords,properties,title) {
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
    var mesh = new THREE.Mesh(geometry, material);

    var imCoords = new itowns.Coordinates('EPSG:4326',coords[0][0] , coords[0][1],0);

    // get the position on the globe, from the camera
    var cameraTargetPosition = globeView.controls.getCameraTargetGeoPosition();

    // position of the mesh
    var meshCoord = imCoords;
    meshCoord.setAltitude(cameraTargetPosition.altitude()+100);

    // position and orientation of the mesh
    mesh.position.copy(meshCoord.as(globeView.referenceCrs).xyz());

    mesh.lookAt(new THREE.Vector3(0, 0, 0));

    // update coordinate of the mesh
    mesh.updateMatrixWorld();

    console.log("propriétés",properties);
    mesh.propriete=properties;
    mesh.title=title;

    // add the mesh to the scene
    globeView.scene.add(mesh);

    objectsLists.push(mesh);

    globeView.controls.setCameraTargetGeoPosition({longitude:-74.70703125, latitude:19.775390624999996}, true);

    // make the object usable from outside of the function
    //globeView.mesh = mesh;
}


function onDocumentMouseDown( event ) {

    //event.preventDefault();

    mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

    var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );

    ray.setFromCamera( mouse, globeView.camera.camera3D );

    var intersects = ray.intersectObjects( objectsLists );

    console.log("intersects list", intersects );
     idNum = Math.floor(Math.random() * 11);
    // Change color if hit block
    if ( intersects.length > 0 )
    {
      console.log(intersects[ 0 ].object.propriete.wmts);

        // Ajout du wmts sur le viewer
        globeView.addLayer({
              update: itowns.FeatureProcessing.update,
              protocol: "wmts",
              id:"layer"+idNum,
              url:""+intersects[ 0 ].object.propriete.wmts+"",
              options: {
              attribution: {
                    name:"openaerialmap",
                    url:"https://api.openaerialmap.org"
              },
              name: intersects[ 0 ].object.title,
              mimetype: "image/png",
              tileMatrixSet: "PM",
              tileMatrixSetLimits: [{
                      minTileRow : 4,
                      maxTileRow : 8,
                      minTileCol : 4,
                      maxTileCol : 8
              }]
        }
      }).then(addLayerCb).then(res=>{idNum++;console.log(idNum);});
            }

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

         ray = new THREE.Raycaster();
         mouse = new THREE.Vector2();
        document.addEventListener( 'mousedown', onDocumentMouseDown, false );

        globeView.controls.setTilt(10, true);
    });
});
