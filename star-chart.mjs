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

function createStar(scene, x, y, z) {
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
    starGlow.scale.multiplyScalar(1.2);
    starCore.add(starGlow);

    // Position the sphere in front of the camera
    starCore.position.set(x, y, z);
    scene.add(starCore); // Add the sphere as a child of the camera
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
const starPositions = [
    [0, 0, 6],
    [5, 0, 0],
    [0, 4, 0],
];
for (let i = 0; i < 3; i++) {
    createStar(scene, starPositions[i][0], starPositions[i][1], starPositions[i][2]);
    if( i > 0 ) {
        createLine(scene, starPositions[i], starPositions[i-1]);
    }
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

document.addEventListener('mouseup', () => {
    isDragging = false;
});

function rotateScene(delta) {
    // Adjust the rotation speed according to your preference
    const rotationSpeed = 0.01;
    
    // Rotate the camera around the Y-axis based on the mouse movement
    camera.position.x = camera.position.x * Math.cos(delta * rotationSpeed) - camera.position.z * Math.sin(delta * rotationSpeed);
    camera.position.z = camera.position.z * Math.cos(delta * rotationSpeed) + camera.position.x * Math.sin(delta * rotationSpeed);
    camera.lookAt(scene.position);
}

animate();
