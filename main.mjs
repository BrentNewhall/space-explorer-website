import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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

let mouseControls = false;
const sensitivity = 0.002;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({
	canvas: document.getElementById("canvas"),
	alpha: true
});
renderer.setSize( window.innerWidth, window.innerHeight );

// Add sun
//const light = new THREE.DirectionalLight( 0xffffff, 1 );
const light = new THREE.PointLight( 0xffffff, 1, 100 );
light.position.set( 1, 1, 5 );
scene.add( light );

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
			keys[e.code] = true;
		}
		if( e.code === 'Space' ) {
			if( jets - jumpJets >= 0 ) {
				jets -= jumpJets;
				updateJetsBar();
				jumping = jumpingInitial;
			}
		}
		if( e.code === 'Slash' ) {
			toggleHidden("help");
		}
		if( e.code === 'Escape' ) {
			returnToSpace();
		}
	});
	window.addEventListener('keyup', (e) => {
		if( e.code in keys ) {
			keys[e.code] = false;
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
		document.getElementById("canvas").requestPointerLock();
	});
	document.addEventListener("pointerlockchange", () => {
		if( document.pointerLockElement === document.getElementById("canvas") ) {
			mouseControls = true;
		}
		else {
			mouseControls = false;
		}
	}, false);
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
	findNearbyArtifacts( artifactObjects, artifactData );
	renderer.render( scene, camera );
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
		loadArtifacts();
	})
	.catch((error) => {
		// Error occurred during loading
		console.error( 'Error loading map models:', error );
	});
}
const tiles = loadTiles( ['map1.gltf','map2.gltf'], worldMap, scene );

// Load sky
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load( 'sky4.jpg', () => {
	const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
	rt.fromEquirectangularTexture(renderer, texture);
	scene.background = rt.texture;
	updateLoadingBar();
});

const loader = new GLTFLoader();

// Load tower
loader.load( 'tower.gltf', function ( gltf ) {
	gltf.scene.position.set(5, 0, -5);
	gltf.scene.scale.set(0.05, 0.05, 0.05);
	scene.add( gltf.scene );
	updateLoadingBar();
}
, undefined, function ( error ) {
	console.error( error );
});

function loadArtifacts() {
	const modelPaths = ['artifact4.gltf', 'artifact5.gltf', 'artifact6.gltf'];
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
	for( let i = 0; i < 10; i++ ) {
		const artifactModel = artifactModels[Math.floor(Math.random() * artifactModels.length)];
		let object = artifactModel.object.clone();
		object.position.set( Math.random() * 14 - 4, 5, Math.random() * 14 - 4 );
		object.scale.set( 0.05, 0.05, 0.05 );
		artifactObjects.push( object );
		artifactData.push( { nearby: false } );
		scene.add( object );
		dropObject( object );	
	}
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

function updateLoadingBar() {
	const totalSteps = 4;
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

setup();
animate();