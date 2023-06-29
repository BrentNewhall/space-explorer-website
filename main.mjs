import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/* import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'; */

const maxTime = 10 * 60;
let oxygen = maxTime;

let movementSpeed = 0.01;

const numArtifacts = 10;
let artifactsCollected = 0;

const jumpingInitial = 0.2;
const jumpingGravity = 0.1;
let jumping = 0;

const maxJets = 1000;
const jumpJets = 200;
let jets = 1000;

let worldMap = [
	[1, 1],
	[2, 1]
];
if( getURLParameter("star") === "alpha-solara") {
	worldMap = [[3, 3, 3], [3, 7, 3], [3, 3, 3]];
}
let star_id = 0;
if( getURLParameter("id") !== null ) {
	star_id = getURLParameter("id");
	if( star_id > 2 ) {
		star_id = 0;
	}
}

let tiles = [];
let collectibles = [];

let mouseControls = false;
const sensitivity = 0.002;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

function getStarDataWeb() {
	const body = {
		"action": "get-star",
		"id": star_id
	}
	const options = {
			method: "POST",
			mode: "cors",
			body: JSON.stringify(body)
	}
	fetch("https://t39cwu86h6.execute-api.us-east-1.amazonaws.com/dev/artifacts", options)
	.then(data => data.json())
	.then(data => {
		updateLoadingBar();
		if( "map" in data ) {
			worldMap = data["map"];
		}
		if( "tiles" in data ) {
			const tileFilenames = data["tiles"].map(tile => tile = "map" + tile + ".gltf");
			tiles = loadTiles( tileFilenames, worldMap, scene );
		}
		if( "sky" in data ) {
			loadSky( data["sky"] );
		}
		if( "collectibles" in data ) {
			collectibles = data["collectibles"].map(name => name += ".gltf");
		}
		if( "features" in data ) {
			for( let feature of data["features"] ) {
				const filename = feature["filename"] + ".gltf";
				const x = feature["x"];
				const z = feature["z"];
				loadFeature( filename, x, z );
			}
		}
		else {
			// No features to load, so progress loading bar
			updateLoadingBar();
		}
	});
}

const renderer = new THREE.WebGLRenderer({
	canvas: document.getElementById("canvas"),
	alpha: true
});
renderer.setSize( window.innerWidth, window.innerHeight );

/* // Create an instance of EffectComposer and set the renderer
const composer = new EffectComposer(renderer);
composer.setSize(window.innerWidth, window.innerHeight);

// Create a render pass
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Create an UnrealBloomPass and configure its parameters
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
composer.addPass(bloomPass); */

// Add sun
//const light = new THREE.DirectionalLight( 0xffffff, 1 );
const sun = new THREE.PointLight( 0xffffff, 1, 0 );
sun.position.set( 1, 25, 1 );
scene.add( sun );

camera.position.y = 0.1;
camera.position.z = 5;
camera.rotation.order = "YXZ";

let artifactObjects = [];
let artifactData = [];

const keys = {
	KeyW: false,
	KeyS: false,
	KeyA: false,
	KeyD: false,
	KeyC: false,
	ShiftLeft: false,
	ArrowLeft: false,
	ArrowRight: false,
	ArrowUp: false,
	ArrowDown: false
}

function getURLParameter(param) {
	const sPageURL = window.location.search.substring(1);
    const sURLVariables = sPageURL.split('&');
    for (let i = 0; i < sURLVariables.length; i++) 
    {
        const sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] === param) 
        {
            return sParameterName[1];
        }
    }
	return null;
}

function toggleHidden(id) {
	let element = document.getElementById(id);
	if( element.style.display === 'block' ) {
		element.style.display = 'none';
	}
	else {
		element.style.display = 'block';
	}
}

function setup() {
	// Add keyboard controls
	window.addEventListener('keydown', (e) => {
		if( e.code in keys ) {
			if( e.code === 'ShiftLeft'  &&  ! keys[e.code] ) {
				playSound( "thrusters" );
			}
			keys[e.code] = true;
		}
		if( e.code === 'Space' ) {
			if( jets - jumpJets >= 0 ) {
				playSound( "thrusters" );
				setTimeout( () => { stopSound( "thrusters" ); }, 1000 );
				jets -= jumpJets;
				updateJetsBar();
				jumping = jumpingInitial;
			}
		}
		if( e.code === 'Escape' ) {
			returnToSpace();
		}
	});
	window.addEventListener('keyup', (e) => {
		if( e.code in keys ) {
			keys[e.code] = false;
			if( e.code === 'ShiftLeft' ) {
				stopSound( "thrusters" );
			}
		}
	});
	// Add mouse controls
	window.addEventListener('mousemove', (e) => {
		if( mouseControls ) {
			camera.rotation.y -= e.movementX * sensitivity;
			camera.rotation.x -= e.movementY * sensitivity;
		}
	});
	// Request pointer lock on canvas click
	document.getElementById("canvas").addEventListener("click", () => {
		if( mouseControls ) {
			document.exitPointerLock();
		}
		else {
			document.getElementById("canvas").requestPointerLock();
		}
	});
	document.addEventListener("pointerlockchange", () => {
		if( document.pointerLockElement === document.getElementById("canvas") ) {
			mouseControls = true;
		}
		else {
			mouseControls = false;
		}
	}, false);
	getStarDataWeb();
}

function updateCameraPosition( movementSpeed ) {
	if( oxygen <= 0 )  return;
	let speed = movementSpeed;
	if( keys.ShiftLeft ) {
		if( jets + 1 > 0 ) {
			speed = speed * 2.5;
			jets -= 1;
			updateJetsBar();
		}
	}
	if( keys.KeyW  ||  keys.ArrowUp ) {
		// Get the direction vector of the camera
		const direction = camera.getWorldDirection(new THREE.Vector3());
		direction.y = 0;
		// Check for any objects in front of the camera
		const raycaster = new THREE.Raycaster();
		raycaster.set(camera.position, direction);
		const intersects = raycaster.intersectObjects( scene.children );
		if( intersects.length === 0  ||  intersects[0].distance > 0.3 ) {
			// Scale the direction vector by the movement speed and add it to the camera's position
			camera.position.add( direction.multiplyScalar( speed ) );
		}
	}
	if( keys.KeyS  ||  keys.ArrowDown ) {
		// Get the direction vector of the camera
		const direction = camera.getWorldDirection(new THREE.Vector3()).negate();
		direction.y = 0;
		// Check for any objects in front of the camera
		const raycaster = new THREE.Raycaster();
		raycaster.set( camera.position, direction );
		const intersects = raycaster.intersectObjects( scene.children );
		if( intersects.length === 0  ||  intersects[0].distance > 0.3 ) {
			// Scale the direction vector by the movement speed and add it to the camera's position
			camera.position.add(direction.multiplyScalar( speed ));
		}
	}
	if( keys.KeyA  ||  keys.ArrowLeft ) {
		camera.rotation.y += speed * 2;
	}
	if( keys.KeyD  ||  keys.ArrowRight ) {
		camera.rotation.y -= speed * 2;
	}
	if( keys.KeyC ) {
		collectArtifact();
	}
	if( jumping > 0 ) {
		camera.position.y += jumping;
		jumping -= jumping * jumpingGravity;
		if( jumping < 0 ) {
			jumping = 0;
		}
	}
}

function gravity(camera) {
	const raycaster = new THREE.Raycaster();
	const direction = new THREE.Vector3( 0, -1, 0 );
	raycaster.set(camera.position, direction);
	const intersects = raycaster.intersectObjects(scene.children);
	if( intersects.length > 0 ) {
		const distance = intersects[0].distance;
		if( distance < 0.15 ) {
			camera.position.y += 0.02;
		}
		else if( distance > 0.2 ) {
			camera.position.y -= 0.005;
		}
	}
}

function dropObject(object) {
	const raycaster = new THREE.Raycaster();
	const direction = new THREE.Vector3(0, -1, 0);
	raycaster.set(object.position, direction);
	const intersects = raycaster.intersectObjects( scene.children );
	if( intersects.length > 0 ) {
		const distance = intersects[0].distance;
		if( distance > 0.1 ) {
			object.position.y -= distance;
			// Rotate the object to face the ground
			/* const faceNormal = intersects[0].face.normal;
			console.log(faceNormal);
			const rotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), faceNormal);
			object.quaternion.copy(rotation); */
			//object.lookAt(rotation);
		}
	}
}	

function findNearbyArtifacts(artifactObjects,artifactData) {
	const raycaster = new THREE.Raycaster();
	const direction = new THREE.Vector3( 0, -1, 0 );
	raycaster.set(camera.position, direction);
	for( let index = 0; index < artifactObjects.length; index++ ) {
		const distance = artifactObjects[index].position.distanceTo(camera.position);
		if( distance < 0.4 ) {
			artifactData[index].nearby = true;
		}
		else {
			artifactData[index].nearby = false;
		}
	}
}

function collectArtifact() {
	for( let index = 0; index < artifactData.length; index++ ) {
		if( artifactData[index].nearby ) {
			scene.remove( artifactObjects[index] );
			artifactObjects.splice( index, 1 );
			artifactData.splice( index, 1 );
			artifactsCollected += 1;
			playSound("equip");
			updateStatus(numArtifacts);
			updateLocalUserData("artifacts");
			sendUserDataWeb(0);
			if( artifactsCollected >= 10 ) {
				setTimeout(() => playSound("success"), 1000 );
			}
		}
	}
}

function animate() {
	gravity(camera);
	updateCameraPosition( movementSpeed );
	requestAnimationFrame( animate );
	//composer.render();
	findNearbyArtifacts( artifactObjects, artifactData );
	renderer.render( scene, camera );
}

function getTile( tiles, id ) {
	const tile = tiles.filter( (obj) => { return obj.id == id } );
	return tile[0];
}

function addBorderTile( tiles, id, scene, x, z, rotation ) {
	let cornerTile = getTile(tiles, id).object.clone();
	cornerTile.position.set( x, 0, z );
	cornerTile.rotation.y += rotation;
	scene.add(cornerTile);
}

function addBorderTiles( tiles, worldMap, scene ) {
	const worldSize = worldMap.length * 10;
	// Upper left
	addBorderTile( tiles, 4, scene, -10, -10, 0 ); // Upper left corner
	addBorderTile( tiles, 4, scene, -10, worldSize, Math.PI / 2 ); // Lower left corner
	addBorderTile( tiles, 4, scene, worldSize, worldSize, (2 * Math.PI) / 2 ); // Lower right corner
	addBorderTile( tiles, 4, scene, worldSize, -10, (3 * Math.PI) / 2 ); // Upper right corner
	for( let i = 0; i < worldMap.length; i++ ) {
		addBorderTile( tiles, 5, scene, -10, i * 10, 0 ); // Left edge
		addBorderTile( tiles, 5, scene, i * 10, -10, (3 * Math.PI) / 2 ); // Top edge
		addBorderTile( tiles, 5, scene, worldSize, i * 10, (2 * Math.PI) / 2 ); // Right edge
		addBorderTile( tiles, 5, scene, i * 10, worldSize, Math.PI / 2 ); // Bottom edge
	}
	let oceanTile = getTile(tiles, 6).object.clone();
	oceanTile.position.set( 0, -0.1, 0 );
	oceanTile.scale.set(100, 1, 100);
	scene.add(oceanTile);
}

function addMapsToScene( tiles, worldMap, scene ) {
	let x = 0;
	let z = 0;
	for( let row of worldMap ) {
		for( let cell of row ) {
			let tile = tiles.filter( (obj) => { return obj.id === cell } );
			tile = tile[0].object.clone();
			tile.position.set( x, 0, z );
			scene.add( tile );
			x += 10;
		}
		x = 0;
		z += 10;
	}
	addBorderTiles( tiles, worldMap, scene );
	updateLoadingBar();
}

function loadTiles(modelPaths, worldMap, scene) {
	// Array to hold the loaded GLTF models
	const tileModels = [];

	// Create an array of promises for loading the models
	const loadPromises = modelPaths.map( (modelPath) => {
		return new Promise( (resolve, reject) => {
			const loader = new GLTFLoader();
			loader.load( modelPath, (gltf) => {
				let modelId = modelPath.split('.')[0];
				modelId = Number(modelId.replace('map', ''));
				tileModels.push( {
					id: modelId,
					object: gltf.scene
				})
				resolve(); // Resolve the promise once the model is loaded
			}, undefined, reject);
		});
	});

	// Wait for all promises to resolve
	Promise.all( loadPromises )
	.then(() => {
		addMapsToScene( tileModels, worldMap, scene );
		loadArtifacts( collectibles );
	})
	.catch((error) => {
		// Error occurred during loading
		console.error( 'Error loading map models:', error );
	});
}

// Load sky
function loadSky(filename) {
	const textureLoader = new THREE.TextureLoader();
	const texture = textureLoader.load( filename, () => {
		const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
		rt.fromEquirectangularTexture(renderer, texture);
		scene.background = rt.texture;
		updateLoadingBar();
	});
}

const loader = new GLTFLoader();

function loadFeature(filename, x, z) {
	loader.load( filename, function ( gltf ) {
		gltf.scene.position.set(x, 0, z);
		if( filename === "tower.gltf" ) {
			gltf.scene.scale.set(0.05, 0.05, 0.05);
		}
		scene.add( gltf.scene );
		updateLoadingBar();
	}
	, undefined, function ( error ) {
		console.error( error );
	});
}

function loadArtifacts(modelPaths) {
	let artifactModels = [];
	const loadPromises = modelPaths.map( (modelPath) => {
		return new Promise( (resolve, reject) => {
			const loader = new GLTFLoader();
			loader.load( modelPath, (gltf) => {
				let modelId = modelPath.split('.')[0];
				modelId = Number(modelId.replace('artifact', ''));
				artifactModels.push( {
					id: modelId,
					object: gltf.scene
				})
				resolve(); // Resolve the promise once the model is loaded
			}, undefined, reject);
		});
	});

	// Wait for all promises to resolve
	Promise.all( loadPromises )
	.then(() => {
		generateArtifacts( scene, artifactModels );
		updateStatus(numArtifacts);
		updateLoadingBar();
	})
	.catch((error) => {
		// Error occurred during loading
		console.error( 'Error loading artifact models:', error );
	});
}

function generateArtifacts( scene, artifactModels ) {
	let worldSize = worldMap.length * 10;
	for( let i = 0; i < 10; i++ ) {
		const artifactModel = artifactModels[Math.floor(Math.random() * artifactModels.length)];
		let object = artifactModel.object.clone();
		object.position.set( Math.random() * worldSize - 5, 20, Math.random() * worldSize - 5 );
		object.scale.set( 0.05, 0.05, 0.05 );
		artifactObjects.push( object );
		artifactData.push( { nearby: false } );
		scene.add( object );
		dropObject( object );	
	}
}

function generateGlowingCube() {
	// Create a cube geometry
	const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);

	// Create an inner material with emissive color
	const innerMaterial = new THREE.MeshBasicMaterial({
		color: 0x8888ff,
		emissive: 0x8888ff,
		side: THREE.BackSide, // Render only the back side of the cube
  	});
	// Create an outer material with a transparent material
const outerMaterial = new THREE.MeshBasicMaterial({
	color: 0xffffff,
	transparent: true,
	opacity: 0.5,
  });
// Create an inner cube mesh
const innerCube = new THREE.Mesh(geometry, innerMaterial);

// Create an outer cube mesh
const outerCube = new THREE.Mesh(geometry, outerMaterial);

// Add the inner and outer cubes to the scene
scene.add(innerCube);
scene.add(outerCube);
  
	const light = new THREE.PointLight( 0x8888ff, 1, 5, 2 );
	light.intensity = 1;
	innerCube.add( light );
	innerCube.position.set(0, 0.2, 0);
	innerCube.position.set(0, 0.2, 0);
}

function updateStatus(numArtifacts) {
	const percent = Math.floor((artifactsCollected / numArtifacts) * 100);
	document.getElementsByClassName("progress-collected")[0].style.width = percent + "%";
}

function updateJetsBar() {
	const percent = Math.floor((jets / maxJets) * 100);
	const progressBar = document.querySelector('.progress-jets');
	progressBar.style.width = percent + '%';
}

// Function to update the progress bar
function updateOxygenBar(progress) {
	const progressBar = document.querySelector('.progress-oxygen');
	progressBar.style.width = progress + '%';
}
  
// Function to start the countdown
function startOxygenCountdown() {  
	// Update the progress bar every second
	const countdownInterval = setInterval(() => {
		oxygen--;
		const progress = (oxygen / maxTime) * 100; // Calculate the progress percentage
		updateOxygenBar(progress);
	
		if (oxygen <= 0) {
			clearInterval(countdownInterval);
			oxygenDepleted();
		}
	}, 1000);
}
  
// Call the startCountdown function to initiate the countdown
startOxygenCountdown();

function oxygenDepleted() {
	document.getElementById("oxygen-depleted").style.display = "block";
	document.getElementById("loading-dark-panel").style.display = "block";
}

function returnToSpace() {
	window.close();
}

function playSound(sound) {
	const element = document.getElementById('sfx-' + sound);
	if( typeof element !== 'undefined'  &&  element !== null )
		element.play();
	else
		console.error( "Sound not found: " + sound );
}

function stopSound(sound) {
	let element = document.getElementById('sfx-' + sound);
	if( typeof element !== 'undefined'  &&  element !== null ) {
		element.pause();
	}
	else
		console.error( "Sound not found: " + sound );
}

function updateLoadingBar() {
	const totalSteps = 5;
	if( typeof updateLoadingBar.steps === 'undefined' ) {
		updateLoadingBar.steps = 0;
	}
	updateLoadingBar.steps++;
	if( updateLoadingBar.steps >= totalSteps ) {
		document.getElementById("loading").style.display = "none";
		document.getElementById("loading-dark-panel").style.display = "none";
	}
	else {
		const width = Math.floor((updateLoadingBar.steps / totalSteps) * 100);
		document.getElementById("progress").style.width = width + "%";
	}
}

import { getUserDataWeb, updateLocalUserData, sendUserDataWeb } from '/user-data.mjs';
getUserDataWeb(0, true); // User ID = 0

setup();
animate();