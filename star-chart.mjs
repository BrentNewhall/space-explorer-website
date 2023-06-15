import * as THREE from 'three';

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 50;

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
//document.body.appendChild(renderer.domElement);
document.getElementById('canvas').appendChild(renderer.domElement);

function createStar(scene) {
    // Create a sphere geometry
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);

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
    const distance = 50; // Distance of the sphere from the camera
    starCore.position.set(Math.floor(Math.random() * distance) - (distance / 2), Math.floor(Math.random() * distance) - (distance / 2), Math.floor(Math.random() * distance) - (distance / 2));
    scene.add(starCore); // Add the sphere as a child of the camera
}

// Add the camera to the scene
scene.add(camera);

for (let i = 0; i < 50; i++) {
    createStar(scene);
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Update any animations or movements here

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
    console.log("Delta:" + delta);
  // Adjust the rotation speed according to your preference
  const rotationSpeed = 0.01;
  
  // Rotate the camera around the Y-axis based on the mouse movement
  camera.position.x = camera.position.x * Math.cos(delta * rotationSpeed) - camera.position.z * Math.sin(delta * rotationSpeed);
  camera.position.z = camera.position.z * Math.cos(delta * rotationSpeed) + camera.position.x * Math.sin(delta * rotationSpeed);
  camera.lookAt(scene.position);
}

animate();
