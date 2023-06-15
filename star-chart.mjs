import * as THREE from 'three';

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 50;

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas').appendChild(renderer.domElement);

function createStar(scene, stars, x, y, z) {
    // Create a sphere geometry
    const sphereGeometry = new THREE.SphereGeometry(0.1, 32, 32);

    // Create a material for the core
    const sphereCoreMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    // Create a material for the glow effect
    const sphereGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        blending: THREE.AdditiveBlending
    });

    // Create a mesh for the core using the geometry and material
    const starCore = new THREE.Mesh(sphereGeometry, sphereCoreMaterial);
    const starGlow = new THREE.Mesh(sphereGeometry, sphereGlowMaterial);

    // Scale the glow sphere to make it larger than the core sphere
    starGlow.scale.multiplyScalar(1.9);
    starCore.add(starGlow);

    // Position the sphere in front of the camera
    starCore.position.set(x, y, z);
    scene.add(starCore); // Add the sphere as a child of the camera
    stars.push(starCore);
}

function createLine(scene, currPosition, prevPosition) {
    const startPoint = new THREE.Vector3(currPosition[0], currPosition[1], currPosition[2]);
    const endPoint = new THREE.Vector3(prevPosition[0], prevPosition[1], prevPosition[2]);
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([startPoint, endPoint]);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x888888 });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(line);
}

// Add the camera to the scene
scene.add(camera);

const distance = 50; // Max distance of stars from galactic center
const constellations = [
    [
        [0, 0, 1],
        [3, 4, 0],
        [8, 7, 0],
        [15, 10, 3]
    ],
    [
        [-1.2, 1.2, 2.2],
        [-2.5, 7.83, 8.31],
        [-8.73, 15.5, 9.98],
        [-10.2, 18.5, 14.5]
    ],
    [
        [6.2, 7.2, 2.95],
        [7.2, 12.2, 4.1],
        [10.38, 14.1, 12.95],
]
];
const otherStars = [
    [23.33,-22.4,22.53],
    [15.66,17.27,-5.08],
    [-14.53,-17.94,10.5],
    [-15.87,0.52,16.72],
    [-4.88,2.71,-6.79],
    [-12.65,13.06,-21.53],
    [12.95,-3.9,-9.51],
    [8.16,-24.77,4.78],
    [8.38,-17.9,-5.52],[11.59,-22.64,23.47],[-13.33,13.66,3.59],[21.48,-19.06,-1.38],[7.72,-16.49,9.37],
    [8.5,-23.7,16.78],[-21.06,-2.1,16.65],[-20.25,21.02,-13.99],[12.63,3.21,-15.97],[18.77,-10.54,-19.85],
    [-21.2,5.73,2.1],[0.8,-19.94,12.61],[12.8,18.1,-21.3],[18.1,14.92,-23.7],[16.1,-1.3,8.9],
    [-3.88,-20.07,9.73],[21.67,-11.79,14.38],[-16.22,23.45,10.56],[-11.52,-14.91,18.41],[-7.33,17.44,15.56],
    [5.35,11.74,13.76],[21.95,-2.26,-14.31],[-4.94,-10.81,-3.63],[-1.52,23.35,-14.06],[-8.06,-17.29,4.94],
    [-19.74,-1.57,-8.28],[4.72,-21.44,-1.16],[-0.86,18.9,23.6],[-3.34,-19.51,-12.6],[6.54,-6.3,8.97]
]
const stars = [];
for( let j = 0; j < constellations.length; j++ ) {
    const positions = constellations[j];
    for (let i = 0; i < positions.length; i++) {
        createStar(scene, stars, positions[i][0], positions[i][1], positions[i][2]);
        if( i > 0 ) {
            createLine(scene, positions[i], positions[i-1]);
        }
    }
}
for (let i = 0; i < otherStars.length; i++) {
    createStar(scene, stars, otherStars[i][0], otherStars[i][1], otherStars[i][2]);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

let isDragging = false;
let previousMouseX = 0;

document.addEventListener('mousedown', (event) => {
    isDragging = true;
    previousMouseX = event.clientX;
});

document.addEventListener('mousemove', (event) => {
    if (isDragging) {
        const delta = event.clientX - previousMouseX;
        rotateScene(delta);
        previousMouseX = event.clientX;
    }
});

document.addEventListener('mouseup', (event) => {
    isDragging = false;
    checkClicked(event);
});

function checkClicked(event) {
    console.log("clicked")
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    console.log(mouse)
  
    // Create a raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
  
    // Check for intersections with the sphere objects
    const intersects = raycaster.intersectObjects(stars);
    const nearObject = intersects.find(intersect => intersect.distance <= 5);
  
    // If there is an intersection, call your desired function
    if (intersects.length > 0) {
        console.log("found")
        const closestObject = findClosestObject(intersects, raycaster.ray.origin);
        handleClosestObject(closestObject);
    }
}

function findClosestObject(intersects, origin) {
    let closestDistance = Infinity;
    let closestObject = null;
  
    for (const intersect of intersects) {
      const distance = origin.distanceTo(intersect.point);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestObject = intersect.object;
      }
    }
  
    return closestObject;
}
  
function handleClosestObject(object) {
    // Perform your desired action with the closest object
    console.log('Closest object:', object);
}

function rotateScene(delta) {
    // Adjust the rotation speed according to your preference
    const rotationSpeed = 0.01;
    
    // Rotate the camera around the Y-axis based on the mouse movement
    camera.position.x = camera.position.x * Math.cos(delta * rotationSpeed) - camera.position.z * Math.sin(delta * rotationSpeed);
    camera.position.z = camera.position.z * Math.cos(delta * rotationSpeed) + camera.position.x * Math.sin(delta * rotationSpeed);
    camera.lookAt(scene.position);
}

function onScroll(event) {
    const delta = event.deltaY;
    const speed = 0.02;
    const distanceToOrigin = camera.position.distanceTo( new THREE.Vector3(0, 0, 0) );
    const newDistanceToOrigin = distanceToOrigin + (delta * speed);
    if( newDistanceToOrigin >= 10  &&  newDistanceToOrigin <= 75 ) {
        camera.position.setLength(newDistanceToOrigin);
        camera.lookAt( 0, 0, 0 );
    }
}

document.addEventListener('wheel', onScroll, false);

animate();
