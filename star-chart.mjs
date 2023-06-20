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

function createStar(scene, starData, x, y, z) {
    // Create a sphere geometry
    const sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32);

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
    //starCore.add(starGlow);

    // Position the sphere in front of the camera
    starCore.position.set(x, y, z);
    scene.add(starCore); // Add the sphere as a child of the camera
    //stars.push(starCore);
    starData["object"] = starCore;
}

function createLine(scene, currPosition, prevPosition) {
    const startPoint = new THREE.Vector3(currPosition[0], currPosition[1], currPosition[2]);
    const endPoint = new THREE.Vector3(prevPosition[0], prevPosition[1], prevPosition[2]);
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([startPoint, endPoint]);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x8888ff });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(line);
}

// Add the camera to the scene
scene.add(camera);

//const distance = 50; // Max distance of stars from galactic center
const allStars = [
    {
        "starlane": "Alpha",
        "name": "Lyrion",
        "position": [0,0,1],
        "resources": ["Artifacts"]
    },
    {
        "starlane": "Alpha",
        "name": "Solara",
        "position": [3,4,0],
        "resources": ["Artifacts"]
    },
    {
        "starlane": "Alpha",
        "name": "Andromira",
        "position": [8,7,0]
    },
    {
        "starlane": "Alpha",
        "name": "Oranex",
        "position": [15,10,3]
    },
    {
        "starlane": "Beta",
        "name": "Centoris",
        "position": [6.2, 7.2, 2.95]
    },
    {
        "starlane": "Beta",
        "name": "Dracosen",
        "position": [7.2, 12.2, 4.1]
    },
    {
        "starlane": "Beta",
        "name": "Aurora",
        "position": [10.38, 14.1, 12.95]
    },
    {
        "starlane": "Gamma",
        "name": "Betelius",
        "position": [-1.2, 1.2, 2.2]
    },
    {
        "starlane": "Gamma",
        "name": "Serpentus",
        "position": [-2.5, 7.83, 8.31]
    },
    {
        "starlane": "Gamma",
        "name": "Velerion",
        "position": [-8.73, 15.5, 9.98]
    },
    {
        "starlane": "Gamma",
        "name": "Intaron",
        "position": [-10.2, 18.5, 14.5]
    },
    {
        "position": [23.33,-22.4,22.53]
    },
    {"position": [15.66,17.27,-5.08]},
    {"position": [-14.53,-17.94,10.5]},
    {"position": [-15.87,0.52,16.72]},
    {"position": [-4.88,2.71,-6.79]},
    {"position": [-12.65,13.06,-21.53]},
    {"position": [12.95,-3.9,-9.51]},
    {"position": [8.16,-24.77,4.78]},
    {"position": [8.38,-17.9,-5.52]},
    {"position": [11.59,-22.64,23.47]},
    {"position": [-13.33,13.66,3.59]},
    {"position": [21.48,-19.06,-1.38]},
    {"position": [7.72,-16.49,9.37]},
    {"position": [8.5,-23.7,16.78]},
    {"position": [-21.06,-2.1,16.65]},
    {"position": [-20.25,21.02,-13.99]},
    {"position": [12.63,3.21,-15.97]},
    {"position": [18.77,-10.54,-19.85]},
    {"position": [-21.2,5.73,2.1]},
    {"position": [0.8,-19.94,12.61]},
    {"position": [12.8,18.1,-21.3]},
    {"position": [18.1,14.92,-23.7]},
    {"position": [16.1,-1.3,8.9]},
    {"position": [-3.88,-20.07,9.73]},
    {"position": [21.67,-11.79,14.38]},
    {"position": [-16.22,23.45,10.56]},
    {"position": [-11.52,-14.91,18.41]},
    {"position": [-7.33,17.44,15.56]},
    {"position": [5.35,11.74,13.76]},
    {"position": [21.95,-2.26,-14.31]},
    {"position": [-4.94,-10.81,-3.63]},
    {"position": [-1.52,23.35,-14.06]},
    {"position": [-8.06,-17.29,4.94]},
    {"position": [-19.74,-1.57,-8.28]},
    {"position": [4.72,-21.44,-1.16]},
    {"position": [-0.86,18.9,23.6]},
    {"position": [-3.34,-19.51,-12.6]},
    {"position": [6.54,-6.3,8.97]}
]

const stars = [];

let currStarlane = null;
for( const [index,starData] of allStars.entries() ) {
    if( "starlane" in starData ) {
        if( currStarlane == starData["starlane"] ) {
            // Draw line
            createLine(scene, allStars[index].position, allStars[index-1].position);
        }
        currStarlane = starData["starlane"];
    }
    // Draw star
    createStar(scene, starData, starData.position[0], starData.position[1], starData.position[2]);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    rotateScene(0.1);
    renderer.render(scene, camera);
}

let isDragging = false;
let previousMouseX = 0;

function changeStar(star,color,radius) {
    star.material.color = new THREE.Color(color);
    star.geometry.radius = radius;
    star.geometry.computeBoundingSphere();
    const currentRadius = star.geometry.boundingSphere.radius;
    const scale = radius / currentRadius;
    star.scale.set(scale, scale, scale);
}

function changeStarDetails(star, active) {
    const starlane = star["starlane"].toLowerCase();
    const name = star["name"].toLowerCase();
    const starID = starlane + "-" + name;
    (active === "active") ? document.getElementById(starlane).classList.add("active") : document.getElementById(starlane).classList.remove("active"); 
    (active === "active") ? document.getElementById(starID).classList.add("active") : document.getElementById(starID).classList.remove("active");
    let details = "<h2>" + star["name"] + "</h2>";
    if( "resources" in star ) {
        details += "<p><strong>Resources:</strong> ";
        for( const [index,resource] of star["resources"].entries() ) {
            details += resource + ",";
        }
        if( star["resources"].length > 0 ) {
            details = details.slice(0, -1);
        }
        details += "</p>";
    }   
    document.getElementById("details").innerHTML = details;
    const btn = document.createElement("button");
    btn.innerText = "Explore";
    btn.onclick = function() {
        window.open("index.html?star=" + starlane + "-" + name, "_blank");
    }
    btn.classList.add("explore-btn");
    document.getElementById("details").appendChild(btn);
}

let currStar = -1;
document.addEventListener('keyup', (event) => {
    if (event.key === ' ') {
        makeStarActive( (currStar + 1) % 11 );
    }
});

function makeStarActive(newStarIndex) {
    let star = null;
    if( currStar >= 0 ) {
        star = allStars[currStar]["object"];
        changeStar( star, 0xffffff, 0.2);
        changeStarDetails(allStars[currStar], "inactive");
    }
    currStar = newStarIndex;
    star = allStars[currStar]["object"];
    changeStar( star, 0xffee66, 0.5);
    changeStarDetails(allStars[currStar], "active");
}
window.makeStarActive = makeStarActive;

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
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
    // Create a raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
  
    // Check for intersections with the sphere objects
    const intersects = raycaster.intersectObjects(stars);
    const nearObject = intersects.find(intersect => intersect.distance <= 5);
  
    // If there is an intersection, call your desired function
    if (intersects.length > 0) {
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
