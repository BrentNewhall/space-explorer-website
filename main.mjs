import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

/* const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube ); */

// Add sun

const light = new THREE.DirectionalLight( 0xffffff, 1 );
light.position.set( 0, 1, 0 );
scene.add( light );

camera.position.y = 0.1;
camera.position.z = 5;

let movementSpeed = 0.01;

const keys = {
	KeyW: false,
	KeyS: false,
	KeyA: false,
	KeyD: false
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
}

function gravity() {
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

function animate() {
	gravity();
	updateCameraPosition( movementSpeed );
	requestAnimationFrame( animate );

	//cube.rotation.x += 0.01;
	//cube.rotation.y += 0.01;

	renderer.render( scene, camera );
}

// Load map
const loader = new GLTFLoader();
loader.load( 'map1.gltf', function ( gltf ) {
	scene.add( gltf.scene );
}, undefined, function ( error ) {
	console.error( error );
});

setup();
animate();