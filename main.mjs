import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({canvas: document.getElementById("canvas"), alpha: true});
renderer.setSize( window.innerWidth, window.innerHeight );

/* const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube ); */

// Add sun
//const light = new THREE.DirectionalLight( 0xffffff, 1 );
const light = new THREE.PointLight( 0xffffff, 1, 100 );
light.position.set( 1, 1, 5 );
scene.add( light );

camera.position.y = 0.1;
camera.position.z = 5;

let artifactObjects = [];
let artifactData = [];
let artifactsCollected = 0;

let movementSpeed = 0.01;

const keys = {
	KeyW: false,
	KeyS: false,
	KeyA: false,
	KeyD: false,
	KeyC: false
}

function setup() {
	// Add keyboard controls
	window.addEventListener('keydown', (e) => {
		if( e.code in keys ) {
			keys[e.code] = true;
		}
	});
	window.addEventListener('keyup', (e) => {
		if( e.code in keys ) {
			keys[e.code] = false;
		}
	});
}

function updateCameraPosition( movementSpeed ) {
	if( keys.KeyW ) {
		// Get the direction vector of the camera
		const direction = camera.getWorldDirection(new THREE.Vector3());
		// Scale the direction vector by the movement speed and add it to the camera's position
		camera.position.add(direction.multiplyScalar(movementSpeed));
	}
	if( keys.KeyS ) {
		// Get the direction vector of the camera
		const direction = camera.getWorldDirection(new THREE.Vector3()).negate();
		// Scale the direction vector by the movement speed and add it to the camera's position
		camera.position.add(direction.multiplyScalar(movementSpeed));
	}
	if( keys.KeyA ) {
		camera.rotation.y += movementSpeed;
	}
	if( keys.KeyD ) {
		camera.rotation.y -= movementSpeed;
	}
	if( keys.KeyC ) {
		collectArtifact();
	}
}

function gravity(camera) {
	const raycaster = new THREE.Raycaster();
	const direction = new THREE.Vector3(0, -1, 0);
	raycaster.set(camera.position, direction);
	const intersects = raycaster.intersectObjects(scene.children);
	if(intersects.length > 0) {
		const distance = intersects[0].distance;
		if(distance < 0.1) {
			camera.position.y += 0.02;
		}
		else if(distance > 0.15) {
			camera.position.y -= 0.005;
		}
	}
}

function dropObject(object) {
	const raycaster = new THREE.Raycaster();
	const direction = new THREE.Vector3(0, -1, 0);
	raycaster.set(object.position, direction);
	const intersects = raycaster.intersectObjects(scene.children);
	if(intersects.length > 0) {
		const distance = intersects[0].distance;
		console.log(distance);
		console.log(object.position);
		if(distance > 0.1) {
			object.position.y -= distance + 0.54;
		}
		console.log(object.position);
	}
}	

function findNearbyArtifacts(artifactObjects,artifactData) {
	const raycaster = new THREE.Raycaster();
	const direction = new THREE.Vector3(0, -1, 0);
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
			artifactObjects.splice(index, 1);
			artifactData.splice(index, 1);
			artifactsCollected += 1;
			updateStatus();
		}
	}
}

function animate() {
	gravity(camera);
	updateCameraPosition( movementSpeed );
	requestAnimationFrame( animate );
	findNearbyArtifacts( artifactObjects, artifactData );

	//cube.rotation.x += 0.01;
	//cube.rotation.y += 0.01;

	renderer.render( scene, camera );
}

// Load map
const loader = new GLTFLoader();
loader.load( 'map1.gltf', function ( gltf ) {
	scene.add( gltf.scene );
	const scene1 = gltf.scene.clone();
	scene1.position.set(10, 0, 0);
	scene.add( scene1 );
	const scene2 = gltf.scene.clone();
	scene2.position.set(10, 0, -10);
	scene.add( scene2 );
	const scene3 = gltf.scene.clone();
	scene3.position.set(0, 0, -10);
	scene.add( scene3 );
}, undefined, function ( error ) {
	console.error( error );
});

// Load sky
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load( 'eso0932a-1.jpg', () => {
	const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
	rt.fromEquirectangularTexture(renderer, texture);
	scene.background = rt.texture;
});

// Load artifact
loader.load( 'artifact3.gltf', function ( gltf ) {
	for( let i = 0; i < 5; i++ ) {
		generateArtifacts( scene,gltf.scene );
	}
}
, undefined, function ( error ) {
	console.error( error );
});

function generateArtifacts(scene,originalObject) {
	let object = originalObject.clone();
	object.position.set(Math.random() * 8, 0.005, Math.random() * 4);
	object.scale.set(0.05, 0.05, 0.05);
	artifactObjects.push(object);
	artifactData.push({nearby: false});
	scene.add( object );
	//dropObject(object);
}

function updateStatus() {
	document.getElementById("status").innerHTML = "Artifacts: " + artifactsCollected;
}

setup();
animate();