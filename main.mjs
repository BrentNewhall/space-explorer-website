import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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

const numArtifacts = 10;
let artifactObjects = [];
let artifactData = [];
let artifactsCollected = 0;

let movementSpeed = 0.01;

const keys = {
	KeyW: false,
	KeyS: false,
	KeyA: false,
	KeyD: false,
	KeyC: false,
}

const jumpingInitial = 0.2;
const jumpingGravity = 0.1;
let jumping = 0;

function setup() {
	// Add keyboard controls
	window.addEventListener('keydown', (e) => {
		if( e.code in keys ) {
			keys[e.code] = true;
		}
		if( e.code === 'Space' ) {
			jumping = jumpingInitial;
		}
		if( e.code === 'Slash' ) {
			document.getElementById("help").style.display = 'block';
		}
	});
	window.addEventListener('keyup', (e) => {
		if( e.code in keys ) {
			keys[e.code] = false;
		}
		if( e.code === 'Slash' ) {
			document.getElementById("help").style.display = 'none';
		}
	});
}

function updateCameraPosition( movementSpeed ) {
	if( keys.KeyW ) {
		// Get the direction vector of the camera
		const direction = camera.getWorldDirection(new THREE.Vector3());
		// Check for any objects in front of the camera
		const raycaster = new THREE.Raycaster();
		raycaster.set(camera.position, direction);
		const intersects = raycaster.intersectObjects( scene.children );
		if( intersects.length === 0  ||  intersects[0].distance > 0.15 ) {
			// Scale the direction vector by the movement speed and add it to the camera's position
			camera.position.add( direction.multiplyScalar( movementSpeed ) );
		}
	}
	if( keys.KeyS ) {
		// Get the direction vector of the camera
		const direction = camera.getWorldDirection(new THREE.Vector3()).negate();
		// Check for any objects in front of the camera
		const raycaster = new THREE.Raycaster();
		raycaster.set( camera.position, direction );
		const intersects = raycaster.intersectObjects( scene.children );
		if( intersects.length === 0  ||  intersects[0].distance > 0.15 ) {
			// Scale the direction vector by the movement speed and add it to the camera's position
			camera.position.add(direction.multiplyScalar(movementSpeed));
		}
	}
	if( keys.KeyA ) {
		camera.rotation.y += movementSpeed * 2;
	}
	if( keys.KeyD ) {
		camera.rotation.y -= movementSpeed * 2;
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
		if( distance < 0.05 ) {
			camera.position.y += 0.02;
		}
		else if( distance > 0.1 ) {
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

// Load map
let worldMap = [
	[1, 1],
	[2, 1]
];

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
	}
	else {
		const width = Math.floor((updateLoadingBar.steps / totalSteps) * 100);
		document.getElementById("progress").style.width = width + "%";
	}
}

setup();
animate();