// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lock mouse for control
document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock;
document.addEventListener('click', () => document.body.requestPointerLock(), false);

// Debugging: Blue background
renderer.setClearColor(0x0000ff);

// Pigeon (customizable model)
const pigeon = new THREE.Group();
let bodyGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.5);
let bodyMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
pigeon.add(body);
let wingGeometry = new THREE.BoxGeometry(0.4, 0.04, 0.2);
let wingMaterial = new THREE.MeshBasicMaterial({ color: 0xdddddd });
const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
leftWing.position.set(-0.3, 0, 0);
leftWing.rotation.z = Math.PI / 6;
pigeon.add(leftWing);
const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
rightWing.position.set(0.3, 0, 0);
rightWing.rotation.z = -Math.PI / 6;
pigeon.add(rightWing);
const beakGeometry = new THREE.BoxGeometry(0.1, 0.06, 0.06);
const beakMaterial = new THREE.MeshBasicMaterial({ color: 0xffa500 });
const beak = new THREE.Mesh(beakGeometry, beakMaterial);
beak.position.set(0, 0, 0.3);
pigeon.add(beak);
// Feet
let feetGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
let feetMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
const leftFoot = new THREE.Mesh(feetGeometry, feetMaterial);
leftFoot.position.set(-0.1, -0.1, 0.1);
pigeon.add(leftFoot);
const rightFoot = new THREE.Mesh(feetGeometry, feetMaterial);
rightFoot.position.set(0.1, -0.1, 0.1);
pigeon.add(rightFoot);

// Ground
const worldSize = 400;
const groundGeometry = new THREE.PlaneGeometry(worldSize, worldSize);
const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x666633 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Roads and Sidewalks
const roadWidth = 8;
const sidewalkWidth = 3;
const roadPositions = [];
const sidewalkPositions = [];
for (let x = -180; x <= 180; x += 40) {
    const roadH = new THREE.Mesh(
        new THREE.BoxGeometry(worldSize, 0.1, roadWidth),
        new THREE.MeshBasicMaterial({ color: 0x333333 })
    );
    roadH.position.set(0, 0.05, x);
    scene.add(roadH);
    roadPositions.push({ x: 0, z: x, isHorizontal: true });

    const sidewalkH1 = new THREE.Mesh(
        new THREE.BoxGeometry(worldSize, 0.15, sidewalkWidth),
        new THREE.MeshBasicMaterial({ color: 0xd3d3d3 })
    );
    sidewalkH1.position.set(0, 0.075, x + roadWidth / 2 + sidewalkWidth / 2);
    scene.add(sidewalkH1);
    sidewalkPositions.push({ x: 0, z: x + roadWidth / 2 + sidewalkWidth / 2, isHorizontal: true });

    const sidewalkH2 = new THREE.Mesh(
        new THREE.BoxGeometry(worldSize, 0.15, sidewalkWidth),
        new THREE.MeshBasicMaterial({ color: 0xd3d3d3 })
    );
    sidewalkH2.position.set(0, 0.075, x - roadWidth / 2 - sidewalkWidth / 2);
    scene.add(sidewalkH2);
    sidewalkPositions.push({ x: 0, z: x - roadWidth / 2 - sidewalkWidth / 2, isHorizontal: true });

    const roadV = new THREE.Mesh(
        new THREE.BoxGeometry(roadWidth, 0.1, worldSize),
        new THREE.MeshBasicMaterial({ color: 0x333333 })
    );
    roadV.position.set(x, 0.05, 0);
    scene.add(roadV);
    roadPositions.push({ x: x, z: 0, isHorizontal: false });

    const sidewalkV1 = new THREE.Mesh(
        new THREE.BoxGeometry(sidewalkWidth, 0.15, worldSize),
        new THREE.MeshBasicMaterial({ color: 0xd3d3d3 })
    );
    sidewalkV1.position.set(x + roadWidth / 2 + sidewalkWidth / 2, 0.075, 0);
    scene.add(sidewalkV1);
    sidewalkPositions.push({ x: x + roadWidth / 2 + sidewalkWidth / 2, z: 0, isHorizontal: false });

    const sidewalkV2 = new THREE.Mesh(
        new THREE.BoxGeometry(sidewalkWidth, 0.15, worldSize),
        new THREE.MeshBasicMaterial({ color: 0xd3d3d3 })
    );
    sidewalkV2.position.set(x - roadWidth / 2 - sidewalkWidth / 2, 0.075, 0);
    scene.add(sidewalkV2);
    sidewalkPositions.push({ x: x - roadWidth / 2 - sidewalkWidth / 2, z: 0, isHorizontal: false });
}

// City buildings
const buildingCount = 200;
const buildings = [];
for (let i = 0; i < buildingCount; i++) {
    const width = Math.random() * 10 + 4;
    const depth = Math.random() * 10 + 4;
    const height = Math.random() * 40 + 10;
    const buildingColors = [0x8b4513, 0xa9a9a9, 0x4682b4, 0xdeb887];
    const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
    const buildingMaterial = new THREE.MeshBasicMaterial({ color: buildingColors[Math.floor(Math.random() * buildingColors.length)] });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);

    let posX, posZ, isValid;
    do {
        posX = (Math.random() - 0.5) * (worldSize - 20);
        posZ = (Math.random() - 0.5) * (worldSize - 20);
        isValid = true;
        for (let road of roadPositions) {
            if (road.isHorizontal) {
                if (Math.abs(posZ - road.z) < (roadWidth / 2 + depth / 2)) isValid = false;
            } else {
                if (Math.abs(posX - road.x) < (roadWidth / 2 + width / 2)) isValid = false;
            }
        }
        for (let sidewalk of sidewalkPositions) {
            if (sidewalk.isHorizontal) {
                if (Math.abs(posZ - sidewalk.z) < (sidewalkWidth / 2 + depth / 2)) isValid = false;
            } else {
                if (Math.abs(posX - sidewalk.x) < (sidewalkWidth / 2 + width / 2)) isValid = false;
            }
        }
    } while (!isValid);
    building.position.set(posX, height / 2, posZ);
    scene.add(building);
    buildings.push({ mesh: building, width, height, depth });
}

// Traffic lights
for (let x = -160; x <= 160; x += 40) {
    for (let z = -160; z <= 160; z += 40) {
        const pole = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 5, 0.2),
            new THREE.MeshBasicMaterial({ color: 0x333333 })
        );
        pole.position.set(x, 2.5, z);
        scene.add(pole);

        const light = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.5, 0.5),
            new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        );
        light.position.set(x, 5, z);
        scene.add(light);
    }
}

// Fire hydrants
for (let i = 0; i < 30; i++) {
    const hydrant = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 1, 0.5),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    let posX, posZ, isValid;
    do {
        posX = (Math.random() - 0.5) * (worldSize - 20);
        posZ = (Math.random() - 0.5) * (worldSize - 20);
        isValid = true;
        for (let road of roadPositions) {
            if (road.isHorizontal) {
                if (Math.abs(posZ - road.z) < roadWidth / 2) isValid = false;
            } else {
                if (Math.abs(posX - road.x) < roadWidth / 2) isValid = false;
            }
        }
        for (let sidewalk of sidewalkPositions) {
            if (sidewalk.isHorizontal) {
                if (Math.abs(posZ - sidewalk.z) < sidewalkWidth / 2) isValid = false;
            } else {
                if (Math.abs(posX - sidewalk.x) < sidewalkWidth / 2) isValid = false;
            }
        }
    } while (!isValid);
    hydrant.position.set(posX, 0.5, posZ);
    scene.add(hydrant);
}

// NPCs
const npcCount = 50;
const npcs = [];
const hatTypes = [
    { geometry: new THREE.BoxGeometry(0.6, 0.2, 0.6), color: 0xff0000 },
    { geometry: new THREE.BoxGeometry(0.8, 0.6, 0.8), color: 0x0000ff },
    { geometry: new THREE.BoxGeometry(0.7, 0.3, 0.7), color: 0xffff00 },
    { geometry: new THREE.BoxGeometry(0.8, 0.4, 0.8), color: 0x800080 },
    { geometry: new THREE.BoxGeometry(0.5, 0.5, 0.5), color: 0x00ff00 }
];
for (let i = 0; i < npcCount; i++) {
    const npc = new THREE.Group();
    const npcBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 1.5, 0.5),
        new THREE.MeshBasicMaterial({ color: 0x0000ff })
    );
    npc.add(npcBody);
    const npcHead = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.4, 0.4),
        new THREE.MeshBasicMaterial({ color: 0xffd700 })
    );
    npcHead.position.y = 1;
    npc.add(npcHead);

    if (Math.random() < 0.5) {
        const hatType = hatTypes[Math.floor(Math.random() * hatTypes.length)];
        const hat = new THREE.Mesh(
            hatType.geometry,
            new THREE.MeshBasicMaterial({ color: hatType.color })
        );
        hat.position.y = 1.3;
        npc.hat = hat;
        npc.hatType = hatType;
        npc.add(hat);
    }

    const sidewalk = sidewalkPositions[Math.floor(Math.random() * sidewalkPositions.length)];
    npc.isHorizontal = sidewalk.isHorizontal;
    npc.sidewalkPos = sidewalk.isHorizontal ? sidewalk.z : sidewalk.x;
    npc.position.set(
        sidewalk.isHorizontal ? (Math.random() - 0.5) * (worldSize - 20) : sidewalk.x,
        0.75,
        sidewalk.isHorizontal ? sidewalk.z : (Math.random() - 0.5) * (worldSize - 20)
    );
    npc.direction = Math.random() < 0.5 ? 1 : -1;
    npc.speed = 0.05 + Math.random() * 0.03;
    npc.id = 'npc_' + i;
    scene.add(npc);
    npcs.push(npc);
}

// Cars
const carCount = 20;
const cars = [];
for (let i = 0; i < carCount; i++) {
    const car = new THREE.Group();
    const carBody = new THREE.Mesh(
        new THREE.BoxGeometry(2, 1, 4),
        new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff })
    );
    car.add(carBody);

    const tireGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const tireMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const tire1 = new THREE.Mesh(tireGeometry, tireMaterial);
    tire1.position.set(-1, -0.25, 1.5);
    car.add(tire1);
    const tire2 = new THREE.Mesh(tireGeometry, tireMaterial);
    tire2.position.set(1, -0.25, 1.5);
    car.add(tire2);
    const tire3 = new THREE.Mesh(tireGeometry, tireMaterial);
    tire3.position.set(-1, -0.25, -1.5);
    car.add(tire3);
    const tire4 = new THREE.Mesh(tireGeometry, tireMaterial);
    tire4.position.set(1, -0.25, -1.5);
    car.add(tire4);

    const windowGeometry = new THREE.BoxGeometry(1.8, 0.5, 0.1);
    const windowMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
    const windowFront = new THREE.Mesh(windowGeometry, windowMaterial);
    windowFront.position.set(0, 0.25, 2);
    car.add(windowFront);
    const windowBack = new THREE.Mesh(windowGeometry, windowMaterial);
    windowBack.position.set(0, 0.25, -2);
    car.add(windowBack);

    const road = roadPositions[Math.floor(Math.random() * roadPositions.length)];
    car.isHorizontal = road.isHorizontal;
    car.roadPos = road.isHorizontal ? road.z : road.x;
    car.position.set(
        road.isHorizontal ? (Math.random() - 0.5) * (worldSize - 20) : road.x,
        0.5,
        road.isHorizontal ? road.z : (Math.random() - 0.5) * (worldSize - 20)
    );
    car.direction = Math.random() < 0.5 ? 1 : -1;
    car.speed = 0.2;
    car.rotation.y = road.isHorizontal ? Math.PI / 2 : 0;
    scene.add(car);
    cars.push(car);
}

// Spawn pigeon safely
let spawnAttempts = 0;
const maxAttempts = 1000;
while (spawnAttempts < maxAttempts) {
    pigeon.position.set(
        (Math.random() - 0.5) * (worldSize - 20),
        5,
        (Math.random() - 0.5) * (worldSize - 20)
    );
    if (!checkCollision(pigeon.position, 0.3, 0.2, 0.5)) {
        break;
    }
    spawnAttempts++;
}
if (spawnAttempts >= maxAttempts) {
    console.error("Couldn’t find a valid spawn point; defaulting to center");
    pigeon.position.set(0, 5, 0);
}
scene.add(pigeon);

// Movement and rotation variables
let pitch = 0;
let yaw = 0;
const speed = 0.3;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let currentHat = null;
const poops = [];
const groundHats = {};
let poopCount = 0;
let wingFlapAngle = 0;
let flapSpeed = 0.1;

// Poop counter UI
const poopCounter = document.createElement('div');
poopCounter.style.position = 'absolute';
poopCounter.style.top = '10px';
poopCounter.style.right = '10px';
poopCounter.style.color = 'white';
poopCounter.style.fontSize = '20px';
poopCounter.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
poopCounter.style.padding = '5px';
poopCounter.textContent = 'People Pooped On: 0';
document.body.appendChild(poopCounter);

// Chat box UI
const chatBox = document.createElement('div');
chatBox.style.position = 'absolute';
chatBox.style.bottom = '10px';
chatBox.style.left = '10px';
chatBox.style.width = '300px';
chatBox.style.height = '150px';
chatBox.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
chatBox.style.color = 'white';
chatBox.style.padding = '10px';
chatBox.style.overflowY = 'scroll';
chatBox.style.fontSize = '14px';
document.body.appendChild(chatBox);

const chatInput = document.createElement('input');
chatInput.type = 'text';
chatInput.style.position = 'absolute';
chatInput.style.bottom = '0px';
chatInput.style.left = '10px';
chatInput.style.width = '240px';
chatInput.placeholder = 'Type to chat...';
document.body.appendChild(chatInput);

const chatSend = document.createElement('button');
chatSend.textContent = 'Send';
chatSend.style.position = 'absolute';
chatSend.style.bottom = '0px';
chatSend.style.left = '260px';
document.body.appendChild(chatSend);

function addChatMessage(message) {
    const msg = document.createElement('div');
    msg.textContent = message;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to bottom
}

chatSend.addEventListener('click', () => {
    const message = chatInput.value.trim();
    if (message && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ chat: message }));
        chatInput.value = '';
    }
});

chatInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        chatSend.click();
    }
});

// Customization screen
const customizationScreen = document.createElement('div');
customizationScreen.style.position = 'absolute';
customizationScreen.style.top = '50%';
customizationScreen.style.left = '50%';
customizationScreen.style.transform = 'translate(-50%, -50%)';
customizationScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
customizationScreen.style.color = 'white';
customizationScreen.style.padding = '20px';
customizationScreen.style.display = 'none';
customizationScreen.innerHTML = `
    <h2>Pigeon Customization</h2>
    <label>Body Color: <input type="color" id="bodyColor" value="#ffffff"></label><br>
    <label>Wing Color: <input type="color" id="wingColor" value="#dddddd"></label><br>
    <label>Feet Color: <input type="color" id="feetColor" value="#808080"></label><br>
    <label>Body Thickness: <input type="range" id="bodyThickness" min="0.1" max="0.5" step="0.05" value="0.3"></label><br>
    <label>Wing Scale: <input type="range" id="wingScale" min="0.2" max="0.6" step="0.05" value="0.4"></label><br>
    <button id="applyCustomization">Apply</button>
`;
document.body.appendChild(customizationScreen);

document.getElementById('applyCustomization').addEventListener('click', () => {
    const customization = {
        bodyColor: document.getElementById('bodyColor').value,
        wingColor: document.getElementById('wingColor').value,
        feetColor: document.getElementById('feetColor').value,
        bodyThickness: parseFloat(document.getElementById('bodyThickness').value),
        wingScale: parseFloat(document.getElementById('wingScale').value)
    };
    applyCustomization(customization);
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ customization }));
    }
    customizationScreen.style.display = 'none';
    document.body.requestPointerLock();
});

function applyCustomization(customization) {
    bodyMaterial.color.set(customization.bodyColor);
    wingMaterial.color.set(customization.wingColor);
    feetMaterial.color.set(customization.feetColor);
    const bodyThickness = customization.bodyThickness;
    const wingScale = customization.wingScale;
    pigeon.remove(body);
    pigeon.remove(leftWing);
    pigeon.remove(rightWing);
    bodyGeometry = new THREE.BoxGeometry(bodyThickness, 0.2, 0.5);
    const newBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    pigeon.add(newBody);
    wingGeometry = new THREE.BoxGeometry(wingScale, 0.04, 0.2);
    const newLeftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    newLeftWing.position.set(-bodyThickness, 0, 0);
    newLeftWing.rotation.z = Math.PI / 6;
    pigeon.add(newLeftWing);
    const newRightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    newRightWing.position.set(bodyThickness, 0, 0);
    newRightWing.rotation.z = -Math.PI / 6;
    pigeon.add(newRightWing);
}

// Keyboard controls
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w': moveForward = true; break;
        case 's': moveBackward = true; break;
        case 'a': moveLeft = true; break;
        case 'd': moveRight = true; break;
        case 'e': handleHatAction(); break;
        case 'p':
            customizationScreen.style.display = 'block';
            document.exitPointerLock();
            break;
    }
});
document.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'w': moveForward = false; break;
        case 's': moveBackward = false; break;
        case 'a': moveLeft = false; break;
        case 'd': moveRight = false; break;
    }
});

// Mouse controls
document.addEventListener('mousemove', (event) => {
    if (document.pointerLockElement === document.body || document.mozPointerLockElement === document.body) {
        const sensitivity = 0.002;
        yaw -= event.movementX * sensitivity;
        pitch -= event.movementY * sensitivity;
        pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
    }
});

document.addEventListener('mousedown', (event) => {
    if (event.button === 0) { // Left click - single poop
        const poopId = Date.now() + Math.random();
        const poop = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.5, 0.5),
            new THREE.MeshBasicMaterial({ color: 0x654321 })
        );
        poop.position.copy(pigeon.position);
        poop.velocity = new THREE.Vector3(0, -0.1, 0);
        poop.acceleration = new THREE.Vector3(0, -0.01, 0);
        poop.id = poopId;
        scene.add(poop);
        poops.push(poop);
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ poop: { x: poop.position.x, y: poop.position.y, z: poop.position.z, id: poopId } }));
        }
    } else if (event.button === 2) { // Right click - diarrhea spray
        const diarrheaPoops = [];
        for (let i = 0; i < 10; i++) {
            const poopId = Date.now() + Math.random() + i;
            const poop = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, 0.3, 0.3),
                new THREE.MeshBasicMaterial({ color: 0x654321 })
            );
            poop.position.copy(pigeon.position);
            const spreadX = (Math.random() - 0.5) * 2;
            const spreadZ = (Math.random() - 0.5) * 2;
            poop.velocity = new THREE.Vector3(spreadX * 0.05, -0.1 - Math.random() * 0.05, spreadZ * 0.05);
            poop.acceleration = new THREE.Vector3(0, -0.01, 0);
            poop.id = poopId;
            scene.add(poop);
            poops.push(poop);
            diarrheaPoops.push({ x: poop.position.x, y: poop.position.y, z: poop.position.z, id: poopId, vx: poop.velocity.x, vz: poop.velocity.z });
        }
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ diarrhea: diarrheaPoops }));
        }
    }
});

document.addEventListener('contextmenu', (event) => event.preventDefault());

// WebSocket connection
const socket = new WebSocket('ws://localhost:8080');
let otherPlayers = {};
let playerId = null;

socket.onopen = () => {
    console.log("WebSocket connected");
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id) playerId = data.id;

    // Player positions and customizations
    const players = data.players || {};
    for (let id in players) {
        if (id !== playerId) {
            if (!otherPlayers[id]) {
                const otherPigeon = new THREE.Group();
                const otherBody = new THREE.Mesh(
                    new THREE.BoxGeometry(0.3, 0.2, 0.5),
                    new THREE.MeshBasicMaterial({ color: 0x666666 })
                );
                otherPigeon.add(otherBody);
                const otherLeftWing = new THREE.Mesh(
                    new THREE.BoxGeometry(0.4, 0.04, 0.2),
                    new THREE.MeshBasicMaterial({ color: 0x555555 })
                );
                otherLeftWing.position.set(-0.3, 0, 0);
                otherLeftWing.rotation.z = Math.PI / 6;
                otherPigeon.add(otherLeftWing);
                const otherRightWing = new THREE.Mesh(
                    new THREE.BoxGeometry(0.4, 0.04, 0.2),
                    new THREE.MeshBasicMaterial({ color: 0x555555 })
                );
                otherRightWing.position.set(0.3, 0, 0);
                otherRightWing.rotation.z = -Math.PI / 6;
                otherPigeon.add(otherRightWing);
                const otherBeak = new THREE.Mesh(
                    new THREE.BoxGeometry(0.1, 0.06, 0.06),
                    new THREE.MeshBasicMaterial({ color: 0xffa500 })
                );
                otherBeak.position.set(0, 0, 0.3);
                otherPigeon.add(otherBeak);
                const otherLeftFoot = new THREE.Mesh(
                    new THREE.BoxGeometry(0.1, 0.1, 0.1),
                    new THREE.MeshBasicMaterial({ color: 0x808080 })
                );
                otherLeftFoot.position.set(-0.1, -0.1, 0.1);
                otherPigeon.add(otherLeftFoot);
                const otherRightFoot = new THREE.Mesh(
                    new THREE.BoxGeometry(0.1, 0.1, 0.1),
                    new THREE.MeshBasicMaterial({ color: 0x808080 })
                );
                otherRightFoot.position.set(0.1, -0.1, 0.1);
                otherPigeon.add(otherRightFoot);
                scene.add(otherPigeon);
                otherPlayers[id] = { group: otherPigeon, body: otherBody, leftWing: otherLeftWing, rightWing: otherRightWing };
            }
            otherPlayers[id].group.position.set(players[id].x, players[id].y, players[id].z);
            otherPlayers[id].group.rotation.y = players[id].yaw || 0;
            if (players[id].customization) {
                const cust = players[id].customization;
                otherPlayers[id].body.material.color.set(cust.bodyColor);
                otherPlayers[id].leftWing.material.color.set(cust.wingColor);
                otherPlayers[id].rightWing.material.color.set(cust.wingColor);
                otherPlayers[id].group.children[4].material.color.set(cust.feetColor);
                otherPlayers[id].group.children[5].material.color.set(cust.feetColor);
                const bodyThickness = cust.bodyThickness;
                const wingScale = cust.wingScale;
                otherPlayers[id].body.geometry = new THREE.BoxGeometry(bodyThickness, 0.2, 0.5);
                otherPlayers[id].leftWing.geometry = new THREE.BoxGeometry(wingScale, 0.04, 0.2);
                otherPlayers[id].rightWing.geometry = new THREE.BoxGeometry(wingScale, 0.04, 0.2);
                otherPlayers[id].leftWing.position.set(-bodyThickness, 0, 0);
                otherPlayers[id].rightWing.position.set(bodyThickness, 0, 0);
            }
            if (players[id].hat) {
                if (!otherPlayers[id].hat) {
                    const hat = new THREE.Mesh(
                        new THREE.BoxGeometry(players[id].hat.width, players[id].hat.height, players[id].hat.depth),
                        new THREE.MeshBasicMaterial({ color: players[id].hat.color })
                    );
                    hat.position.set(0, 0.4, 0);
                    otherPlayers[id].group.add(hat);
                    otherPlayers[id].hat = hat;
                }
            } else if (otherPlayers[id].hat) {
                otherPlayers[id].group.remove(otherPlayers[id].hat);
                delete otherPlayers[id].hat;
            }
        }
    }
    for (let id in otherPlayers) {
        if (!players[id]) {
            scene.remove(otherPlayers[id].group);
            delete otherPlayers[id];
        }
    }

    // Single poop
    if (data.poop) {
        if (!poops.some(p => p.id === data.poop.id)) {
            const poop = new THREE.Mesh(
                new THREE.BoxGeometry(0.5, 0.5, 0.5),
                new THREE.MeshBasicMaterial({ color: 0x654321 })
            );
            poop.position.set(data.poop.x, data.poop.y, data.poop.z);
            poop.velocity = new THREE.Vector3(0, -0.1, 0);
            poop.acceleration = new THREE.Vector3(0, -0.01, 0);
            poop.id = data.poop.id;
            scene.add(poop);
            poops.push(poop);
        }
    }

    // Diarrhea spray
    if (data.diarrhea) {
        data.diarrhea.forEach(d => {
            if (!poops.some(p => p.id === d.id)) {
                const poop = new THREE.Mesh(
                    new THREE.BoxGeometry(0.3, 0.3, 0.3),
                    new THREE.MeshBasicMaterial({ color: 0x654321 })
                );
                poop.position.set(d.x, d.y, d.z);
                poop.velocity = new THREE.Vector3(d.vx, -0.1 - Math.random() * 0.05, d.vz);
                poop.acceleration = new THREE.Vector3(0, -0.01, 0);
                poop.id = d.id;
                scene.add(poop);
                poops.push(poop);
            }
        });
    }

    // Ground hats
    if (data.groundHats) {
        for (let hatId in data.groundHats) {
            if (!groundHats[hatId]) {
                const hatData = data.groundHats[hatId];
                const hat = new THREE.Mesh(
                    new THREE.BoxGeometry(hatData.width, hatData.height, hatData.depth),
                    new THREE.MeshBasicMaterial({ color: hatData.color })
                );
                hat.position.set(hatData.x, hatData.y, hatData.z);
                scene.add(hat);
                groundHats[hatId] = hat;
            }
        }
        for (let hatId in groundHats) {
            if (!data.groundHats[hatId]) {
                scene.remove(groundHats[hatId]);
                delete groundHats[hatId];
            }
        }
    }

    // NPC states
    if (data.npcs) {
        for (let npcId in data.npcs) {
            const npcData = data.npcs[npcId];
            const npc = npcs.find(n => n.id === npcId);
            if (npc) {
                npc.position.set(npcData.x, npcData.y, npcData.z);
                npc.rotation.y = npcData.rotationY;
                if (npcData.hat && !npc.hat) {
                    const hat = new THREE.Mesh(
                        new THREE.BoxGeometry(npcData.hat.width, npcData.hat.height, npcData.hat.depth),
                        new THREE.MeshBasicMaterial({ color: npcData.hat.color })
                    );
                    hat.position.y = 1.3;
                    npc.add(hat);
                    npc.hat = hat;
                    npc.hatType = { geometry: hat.geometry, color: npcData.hat.color };
                } else if (!npcData.hat && npc.hat) {
                    npc.remove(npc.hat);
                    delete npc.hat;
                    delete npc.hatType;
                }
                if (npcData.pooped && !npc.pooped) {
                    npc.children[0].material.color.set(0x654321);
                    npc.pooped = true;
                    if (npcData.pooper === playerId) {
                        poopCount++;
                        poopCounter.textContent = `People Pooped On: ${poopCount}`;
                    }
                }
            }
        }
    }

    // Chat messages
    if (data.chat) {
        addChatMessage(data.chat);
    }

    // Join message
    if (data.join) {
        addChatMessage(`Player ${data.join} has joined the server!`);
    }
};

// Hat action
function handleHatAction() {
    if (currentHat) {
        pigeon.remove(currentHat);
        const hatId = Date.now() + Math.random();
        currentHat.position.set(pigeon.position.x, 0.1, pigeon.position.z);
        scene.add(currentHat);
        groundHats[hatId] = currentHat;
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                dropHat: {
                    id: hatId,
                    x: currentHat.position.x,
                    y: currentHat.position.y,
                    z: currentHat.position.z,
                    width: currentHat.geometry.parameters.width,
                    height: currentHat.geometry.parameters.height,
                    depth: currentHat.geometry.parameters.depth,
                    color: currentHat.material.color.getHex()
                }
            }));
        }
        currentHat = null;
    } else {
        npcs.forEach(npc => {
            if (npc.hat) {
                const distance = pigeon.position.distanceTo(npc.position);
                if (distance < 3) {
                    npc.remove(npc.hat);
                    currentHat = npc.hat;
                    currentHat.position.set(0, 0.4, 0);
                    pigeon.add(currentHat);
                    if (socket.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify({ stealHat: { npcId: npc.id } }));
                    }
                    delete npc.hat;
                    delete npc.hatType;
                }
            }
        });
        for (let hatId in groundHats) {
            const hat = groundHats[hatId];
            const distance = pigeon.position.distanceTo(hat.position);
            if (distance < 3) {
                scene.remove(hat);
                delete groundHats[hatId];
                currentHat = hat;
                currentHat.position.set(0, 0.4, 0);
                pigeon.add(currentHat);
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ pickHat: { hatId } }));
                }
            }
        }
    }
}

// Collision detection
function checkCollision(pos, width, height, depth) {
    for (let building of buildings) {
        const bx = building.mesh.position.x;
        const by = building.mesh.position.y - building.height / 2;
        const bz = building.mesh.position.z;
        const bw = building.width / 2;
        const bh = building.height;
        const bd = building.depth / 2;

        if (
            pos.x - width / 2 < bx + bw && pos.x + width / 2 > bx - bw &&
            pos.y - height / 2 < by + bh && pos.y + height / 2 > by &&
            pos.z - depth / 2 < bz + bd && pos.z + depth / 2 > bz - bd
        ) return true;
    }

    for (let car of cars) {
        const cx = car.position.x;
        const cy = car.position.y - 0.5;
        const cz = car.position.z;
        const cw = 1;
        const ch = 1;
        const cd = 2;

        if (
            pos.x - width / 2 < cx + cw && pos.x + width / 2 > cx - cw &&
            pos.y - height / 2 < cy + ch && pos.y + height / 2 > cy &&
            pos.z - depth / 2 < cz + cd && pos.z + depth / 2 > cz - cd
        ) return true;
    }

    return false;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Flap wings when moving
    if (moveForward || moveBackward || moveLeft || moveRight) {
        wingFlapAngle += flapSpeed;
        leftWing.rotation.z = Math.PI / 6 + Math.sin(wingFlapAngle) * 0.3;
        rightWing.rotation.z = -Math.PI / 6 - Math.sin(wingFlapAngle) * 0.3;
    } else {
        leftWing.rotation.z = Math.PI / 6;
        rightWing.rotation.z = -Math.PI / 6;
    }

    // Update pigeon rotation
    pigeon.rotation.order = 'YXZ';
    pigeon.rotation.y = yaw;
    pigeon.rotation.x = pitch;

    // Move pigeon with collision
    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(pigeon.quaternion);
    const sideDirection = new THREE.Vector3(-1, 0, 0).applyQuaternion(pigeon.quaternion);
    const newPosition = pigeon.position.clone();

    if (moveForward) newPosition.addScaledVector(direction, speed);
    if (moveBackward) newPosition.addScaledVector(direction, -speed);
    if (moveLeft) newPosition.addScaledVector(sideDirection, speed);
    if (moveRight) newPosition.addScaledVector(sideDirection, -speed);

    if (newPosition.y >= 0.5 && !checkCollision(newPosition, 0.3, 0.2, 0.5)) {
        pigeon.position.copy(newPosition);
    }
    if (pigeon.position.y < 0.5) pigeon.position.y = 0.5;

    // Camera
    const cameraOffset = new THREE.Vector3(0, 2, 4);
    cameraOffset.applyQuaternion(pigeon.quaternion);
    camera.position.copy(pigeon.position).add(cameraOffset);
    camera.quaternion.copy(pigeon.quaternion);

    // Send position and state to server
    if (socket.readyState === WebSocket.OPEN) {
        const state = {
            position: { x: pigeon.position.x, y: pigeon.position.y, z: pigeon.position.z },
            yaw: yaw
        };
        if (currentHat) {
            state.hat = {
                width: currentHat.geometry.parameters.width,
                height: currentHat.geometry.parameters.height,
                depth: currentHat.geometry.parameters.depth,
                color: currentHat.material.color.getHex()
            };
        }
        socket.send(JSON.stringify(state));
    }

    // Update NPCs
    npcs.forEach(npc => {
        if (npc.isHorizontal) {
            npc.position.x += npc.speed * npc.direction;
            npc.position.z = npc.sidewalkPos;
            if (npc.position.x > worldSize / 2 - 10 || npc.position.x < -worldSize / 2 + 10) {
                npc.direction *= -1;
                npc.rotation.y = npc.direction > 0 ? Math.PI : 0;
            }
        } else {
            npc.position.z += npc.speed * npc.direction;
            npc.position.x = npc.sidewalkPos;
            if (npc.position.z > worldSize / 2 - 10 || npc.position.z < -worldSize / 2 + 10) {
                npc.direction *= -1;
                npc.rotation.y = npc.direction > 0 ? Math.PI / 2 : -Math.PI / 2;
            }
        }
    });

    // Update Cars
    cars.forEach(car => {
        if (car.isHorizontal) {
            car.position.x += car.speed * car.direction;
            car.position.z = car.roadPos;
            if (car.position.x > worldSize / 2 - 10 || car.position.x < -worldSize / 2 + 10) car.direction *= -1;
        } else {
            car.position.z += car.speed * car.direction;
            car.position.x = car.roadPos;
            if (car.position.z > worldSize / 2 - 10 || car.position.z < -worldSize / 2 + 10) car.direction *= -1;
        }
    });

    // Update Poop
    poops.forEach((poop, index) => {
        poop.velocity.add(poop.acceleration);
        poop.position.add(poop.velocity);
        if (poop.position.y < 0) {
            scene.remove(poop);
            poops.splice(index, 1);
        } else {
            npcs.forEach(npc => {
                const distance = poop.position.distanceTo(npc.position);
                if (distance < 1 && !npc.pooped) {
                    npc.children[0].material.color.set(0x654321);
                    npc.pooped = true;
                    poopCount++;
                    poopCounter.textContent = `People Pooped On: ${poopCount}`;
                    if (socket.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify({ poopHit: { npcId: npc.id, pooper: playerId } }));
                    }
                    scene.remove(poop);
                    poops.splice(index, 1);
                }
            });
        }
    });

    renderer.render(scene, camera);
}
animate();