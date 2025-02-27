// Define worldSize at the top
const worldSize = 400;

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Enable shadows
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadow edges
document.body.appendChild(renderer.domElement);

// Lock mouse for control
document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock;
document.addEventListener('click', function () { document.body.requestPointerLock(); }, false);

// Background: Light blue sky
renderer.setClearColor(0x87ceeb);

// Ambient light (soft base illumination)
const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
scene.add(ambientLight);

// Sun setup
const sunGeometry = new THREE.SphereGeometry(10, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff99 }); // Bright yellowish
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.position.set(200, 300, 200); // High in the sky
scene.add(sun);

// Sun light
const sunLight = new THREE.DirectionalLight(0xffffcc, 1.0); // Warm light, moderate intensity
sunLight.position.copy(sun.position); // Align with the sun
sunLight.target.position.set(0, 0, 0); // Point at scene center
sunLight.castShadow = true; // Enable shadow casting
scene.add(sunLight);
scene.add(sunLight.target);

// Configure shadow properties (worldSize is now defined)
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 600;
sunLight.shadow.camera.left = -worldSize / 2;
sunLight.shadow.camera.right = worldSize / 2;
sunLight.shadow.camera.top = worldSize / 2;
sunLight.shadow.camera.bottom = -worldSize / 2;

// Ground
const groundGeometry = new THREE.PlaneGeometry(worldSize, worldSize);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x666633 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Roads and Sidewalks
const roadWidth = 8;
const sidewalkWidth = 3;
const roadPositions = [];
const sidewalkPositions = [];
for (let x = -180; x <= 180; x += 40) {
    const roadH = new THREE.Mesh(
        new THREE.BoxGeometry(worldSize, 0.1, roadWidth),
        new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    roadH.position.set(0, 0.05, x);
    roadH.receiveShadow = true;
    scene.add(roadH);
    roadPositions.push({ x: 0, z: x, isHorizontal: true });

    const sidewalkH1 = new THREE.Mesh(
        new THREE.BoxGeometry(worldSize, 0.15, sidewalkWidth),
        new THREE.MeshStandardMaterial({ color: 0xd3d3d3 })
    );
    sidewalkH1.position.set(0, 0.075, x + roadWidth / 2 + sidewalkWidth / 2);
    sidewalkH1.receiveShadow = true;
    scene.add(sidewalkH1);
    sidewalkPositions.push({ x: 0, z: x + roadWidth / 2 + sidewalkWidth / 2, isHorizontal: true });

    const sidewalkH2 = new THREE.Mesh(
        new THREE.BoxGeometry(worldSize, 0.15, sidewalkWidth),
        new THREE.MeshStandardMaterial({ color: 0xd3d3d3 })
    );
    sidewalkH2.position.set(0, 0.075, x - roadWidth / 2 - sidewalkWidth / 2);
    sidewalkH2.receiveShadow = true;
    scene.add(sidewalkH2);
    sidewalkPositions.push({ x: 0, z: x - roadWidth / 2 - sidewalkWidth / 2, isHorizontal: true });

    const roadV = new THREE.Mesh(
        new THREE.BoxGeometry(roadWidth, 0.1, worldSize),
        new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    roadV.position.set(x, 0.05, 0);
    roadV.receiveShadow = true;
    scene.add(roadV);
    roadPositions.push({ x: x, z: 0, isHorizontal: false });

    const sidewalkV1 = new THREE.Mesh(
        new THREE.BoxGeometry(sidewalkWidth, 0.15, worldSize),
        new THREE.MeshStandardMaterial({ color: 0xd3d3d3 })
    );
    sidewalkV1.position.set(x + roadWidth / 2 + sidewalkWidth / 2, 0.075, 0);
    sidewalkV1.receiveShadow = true;
    scene.add(sidewalkV1);
    sidewalkPositions.push({ x: x + roadWidth / 2 + sidewalkWidth / 2, z: 0, isHorizontal: false });

    const sidewalkV2 = new THREE.Mesh(
        new THREE.BoxGeometry(sidewalkWidth, 0.15, worldSize),
        new THREE.MeshStandardMaterial({ color: 0xd3d3d3 })
    );
    sidewalkV2.position.set(x - roadWidth / 2 - sidewalkWidth / 2, 0.075, 0);
    sidewalkV2.receiveShadow = true;
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
    const buildingMaterial = new THREE.MeshStandardMaterial({ color: buildingColors[Math.floor(Math.random() * buildingColors.length)] });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.castShadow = true;
    building.receiveShadow = true;

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
            new THREE.MeshStandardMaterial({ color: 0x333333 })
        );
        pole.position.set(x, 2.5, z);
        pole.castShadow = true;
        pole.receiveShadow = true;
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
        new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    hydrant.castShadow = true;
    hydrant.receiveShadow = true;
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
        new THREE.MeshStandardMaterial({ color: 0x0000ff })
    );
    npcBody.castShadow = true;
    npcBody.receiveShadow = true;
    npc.add(npcBody);
    const npcHead = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.4, 0.4),
        new THREE.MeshStandardMaterial({ color: 0xffd700 })
    );
    npcHead.castShadow = true;
    npcHead.receiveShadow = true;
    npcHead.position.y = 1;
    npc.add(npcHead);

    if (Math.random() < 0.5) {
        const hatType = hatTypes[Math.floor(Math.random() * hatTypes.length)];
        const hat = new THREE.Mesh(
            hatType.geometry,
            new THREE.MeshStandardMaterial({ color: hatType.color })
        );
        hat.position.y = 1.3;
        hat.castShadow = true;
        hat.receiveShadow = true;
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
        new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff })
    );
    carBody.castShadow = true;
    carBody.receiveShadow = true;
    car.add(carBody);

    const tireGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const tireMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const tire1 = new THREE.Mesh(tireGeometry, tireMaterial);
    tire1.position.set(-1, -0.25, 1.5);
    tire1.castShadow = true;
    tire1.receiveShadow = true;
    car.add(tire1);
    const tire2 = new THREE.Mesh(tireGeometry, tireMaterial);
    tire2.position.set(1, -0.25, 1.5);
    tire2.castShadow = true;
    tire2.receiveShadow = true;
    car.add(tire2);
    const tire3 = new THREE.Mesh(tireGeometry, tireMaterial);
    tire3.position.set(-1, -0.25, -1.5);
    tire3.castShadow = true;
    tire3.receiveShadow = true;
    car.add(tire3);
    const tire4 = new THREE.Mesh(tireGeometry, tireMaterial);
    tire4.position.set(1, -0.25, -1.5);
    tire4.castShadow = true;
    tire4.receiveShadow = true;
    car.add(tire4);

    const windowGeometry = new THREE.BoxGeometry(1.8, 0.5, 0.1);
    const windowMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    const windowFront = new THREE.Mesh(windowGeometry, windowMaterial);
    windowFront.position.set(0, 0.25, 2);
    windowFront.castShadow = true;
    windowFront.receiveShadow = true;
    car.add(windowFront);
    const windowBack = new THREE.Mesh(windowGeometry, windowMaterial);
    windowBack.position.set(0, 0.25, -2);
    windowBack.castShadow = true;
    windowBack.receiveShadow = true;
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

// Load Seagull Model
let seagull;
let mixer;
const loader = new THREE.GLTFLoader();
loader.load(
    './models/seagull.glb',
    function (gltf) {
        seagull = gltf.scene;
        seagull.scale.set(0.3, 0.3, 0.3);
        seagull.rotation.y = -Math.PI;

        seagull.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                console.log('Mesh:', child.name);
                console.log('Material Name:', child.material.name);
                console.log('Material Type:', child.material.type);
                console.log('Material Color:', child.material.color.getHexString());
                console.log('Texture Map:', child.material.map ? child.material.map.sourceFile || 'Embedded' : 'None');
            }
        });

        let spawnAttempts = 0;
        const maxAttempts = 1000;
        while (spawnAttempts < maxAttempts) {
            seagull.position.set(
                (Math.random() - 0.5) * (worldSize - 20),
                5,
                (Math.random() - 0.5) * (worldSize - 20)
            );
            if (!checkCollision(seagull.position, 0.3, 0.2, 0.5)) break;
            spawnAttempts++;
        }
        if (spawnAttempts >= maxAttempts) {
            console.error("Couldn’t find a valid spawn point; defaulting to center");
            seagull.position.set(0, 5, 0);
        }

        mixer = new THREE.AnimationMixer(seagull);
        const flapAction = mixer.clipAction(gltf.animations.find(function (anim) { return anim.name === 'flap'; }));
        if (!flapAction) console.error("Flap animation not found. Available animations:", gltf.animations);
        flapAction.play();

        scene.add(seagull);
        console.log('Seagull model loaded with flap animation');
    },
    function (xhr) { console.log((xhr.loaded / xhr.total * 100) + '% loaded'); },
    function (error) { console.error('Error loading seagull model:', error); }
);

// Movement and state variables
let pitch = 0, yaw = 0;
const speed = 0.3;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let lastPosition = new THREE.Vector3();
let velocity = new THREE.Vector3();
const clock = new THREE.Clock();
let currentHat = null;
const poops = [];
const groundHats = {};
let poopCount = 0;

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
    chatBox.scrollTop = chatBox.scrollHeight;
}

chatSend.addEventListener('click', function () {
    const message = chatInput.value.trim();
    if (message && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ chat: message }));
        chatInput.value = '';
    }
});

chatInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') chatSend.click();
});

// Keyboard controls
document.addEventListener('keydown', function (event) {
    switch (event.key) {
        case 'w': moveForward = true; break;
        case 's': moveBackward = true; break;
        case 'a': moveLeft = true; break;
        case 'd': moveRight = true; break;
        case 'e': handleHatAction(); break;
    }
});
document.addEventListener('keyup', function (event) {
    switch (event.key) {
        case 'w': moveForward = false; break;
        case 's': moveBackward = false; break;
        case 'a': moveLeft = false; break;
        case 'd': moveRight = false; break;
    }
});

// Mouse controls
document.addEventListener('mousemove', function (event) {
    if (document.pointerLockElement === document.body || document.mozPointerLockElement === document.body) {
        const sensitivity = 0.002;
        yaw -= event.movementX * sensitivity;
        pitch -= event.movementY * sensitivity;
        pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
    }
});

document.addEventListener('mousedown', function (event) {
    if (!seagull) return;
    if (event.button === 0) {
        const poopId = Date.now() + Math.random();
        const poop = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.5, 0.5),
            new THREE.MeshStandardMaterial({ color: 0x654321 })
        );
        poop.position.copy(seagull.position);
        poop.velocity = new THREE.Vector3(0, -0.1, 0);
        poop.acceleration = new THREE.Vector3(0, -0.01, 0);
        poop.id = poopId;
        poop.castShadow = true;
        poop.receiveShadow = true;
        scene.add(poop);
        poops.push(poop);
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ poop: { x: poop.position.x, y: poop.position.y, z: poop.position.z, id: poopId } }));
        }
    } else if (event.button === 2) {
        const diarrheaPoops = [];
        for (let i = 0; i < 10; i++) {
            const poopId = Date.now() + Math.random() + i;
            const poop = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, 0.3, 0.3),
                new THREE.MeshStandardMaterial({ color: 0x654321 })
            );
            poop.position.copy(seagull.position);
            const spreadX = (Math.random() - 0.5) * 2;
            const spreadZ = (Math.random() - 0.5) * 2;
            poop.velocity = new THREE.Vector3(spreadX * 0.05, -0.1 - Math.random() * 0.05, spreadZ * 0.05);
            poop.acceleration = new THREE.Vector3(0, -0.01, 0);
            poop.id = poopId;
            poop.castShadow = true;
            poop.receiveShadow = true;
            scene.add(poop);
            poops.push(poop);
            diarrheaPoops.push({ x: poop.position.x, y: poop.position.y, z: poop.position.z, id: poopId, vx: poop.velocity.x, vz: poop.velocity.z });
        }
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ diarrhea: diarrheaPoops }));
        }
    }
});

document.addEventListener('contextmenu', function (event) { event.preventDefault(); });

// WebSocket connection
const socket = new WebSocket('ws://localhost:8080');
let otherPlayers = {};
let playerId = null;

socket.onopen = function () { console.log("WebSocket connected"); };

socket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    if (data.id) playerId = data.id;

    const players = data.players || {};
    for (let id in players) {
        if (id !== playerId) {
            if (!otherPlayers[id]) {
                const otherSeagull = new THREE.Group();
                loader.load(
                    './models/seagull.glb',
                    function (gltf) {
                        const model = gltf.scene.clone();
                        model.scale.set(0.5, 0.5, 0.5);
                        model.rotation.y = Math.PI; // Flip other seagulls too
                        model.traverse(function (child) {
                            if (child.isMesh) {
                                child.castShadow = true;
                                child.receiveShadow = true;
                            }
                        });
                        otherSeagull.add(model);
                        const otherMixer = new THREE.AnimationMixer(model);
                        const flapAction = otherMixer.clipAction(gltf.animations.find(function (anim) { return anim.name === 'flap'; }));
                        flapAction.play();
                        otherPlayers[id] = { group: otherSeagull, mixer: otherMixer, lastX: 0, lastZ: 0 };
                    }
                );
                scene.add(otherSeagull);
            }
            const playerData = players[id];
            otherPlayers[id].group.position.set(playerData.x, playerData.y, playerData.z);
            otherPlayers[id].group.rotation.y = playerData.yaw || 0;
            if (otherPlayers[id].mixer) {
                const dx = playerData.x - (otherPlayers[id].lastX || playerData.x);
                const dz = playerData.z - (otherPlayers[id].lastZ || playerData.z);
                const speedMagnitude = Math.sqrt(dx * dx + dz * dz) / 0.016;
                const flapSpeed = THREE.MathUtils.lerp(0.5, 2, Math.min(speedMagnitude / speed, 1));
                otherPlayers[id].mixer.timeScale = flapSpeed;
                otherPlayers[id].lastX = playerData.x;
                otherPlayers[id].lastZ = playerData.z;
            }
            if (playerData.hat && !otherPlayers[id].hat) {
                const hat = new THREE.Mesh(
                    new THREE.BoxGeometry(playerData.hat.width, playerData.hat.height, playerData.hat.depth),
                    new THREE.MeshStandardMaterial({ color: playerData.hat.color })
                );
                hat.position.set(0, 0.4, 0);
                hat.castShadow = true;
                hat.receiveShadow = true;
                otherPlayers[id].group.add(hat);
                otherPlayers[id].hat = hat;
            } else if (!playerData.hat && otherPlayers[id].hat) {
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

    if (data.poop && !poops.some(function (p) { return p.id === data.poop.id; })) {
        const poop = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.5, 0.5),
            new THREE.MeshStandardMaterial({ color: 0x654321 })
        );
        poop.position.set(data.poop.x, data.poop.y, data.poop.z);
        poop.velocity = new THREE.Vector3(0, -0.1, 0);
        poop.acceleration = new THREE.Vector3(0, -0.01, 0);
        poop.id = data.poop.id;
        poop.castShadow = true;
        poop.receiveShadow = true;
        scene.add(poop);
        poops.push(poop);
    }

    if (data.diarrhea) {
        data.diarrhea.forEach(function (d) {
            if (!poops.some(function (p) { return p.id === d.id; })) {
                const poop = new THREE.Mesh(
                    new THREE.BoxGeometry(0.3, 0.3, 0.3),
                    new THREE.MeshStandardMaterial({ color: 0x654321 })
                );
                poop.position.set(d.x, d.y, d.z);
                poop.velocity = new THREE.Vector3(d.vx, -0.1 - Math.random() * 0.05, d.vz);
                poop.acceleration = new THREE.Vector3(0, -0.01, 0);
                poop.id = d.id;
                poop.castShadow = true;
                poop.receiveShadow = true;
                scene.add(poop);
                poops.push(poop);
            }
        });
    }

    if (data.groundHats) {
        for (let hatId in data.groundHats) {
            if (!groundHats[hatId]) {
                const hatData = data.groundHats[hatId];
                const hat = new THREE.Mesh(
                    new THREE.BoxGeometry(hatData.width, hatData.height, hatData.depth),
                    new THREE.MeshStandardMaterial({ color: hatData.color })
                );
                hat.position.set(hatData.x, hatData.y, hatData.z);
                hat.castShadow = true;
                hat.receiveShadow = true;
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

    if (data.npcs) {
        for (let npcId in data.npcs) {
            const npcData = data.npcs[npcId];
            const npc = npcs.find(function (n) { return n.id === npcId; });
            if (npc) {
                npc.position.set(npcData.x, npcData.y, npcData.z);
                npc.rotation.y = npcData.rotationY;
                if (npcData.hat && !npc.hat) {
                    const hat = new THREE.Mesh(
                        new THREE.BoxGeometry(npcData.hat.width, npcData.hat.height, npcData.hat.depth),
                        new THREE.MeshStandardMaterial({ color: npcData.hat.color })
                    );
                    hat.position.y = 1.3;
                    hat.castShadow = true;
                    hat.receiveShadow = true;
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
                        poopCounter.textContent = 'People Pooped On: ' + poopCount;
                    }
                }
            }
        }
    }

    if (data.chat) addChatMessage(data.chat);
    if (data.join) addChatMessage('Player ' + data.join + ' has joined the server!');
};

// Hat action
function handleHatAction() {
    if (!seagull) return;
    if (currentHat) {
        seagull.remove(currentHat);
        const hatId = Date.now() + Math.random();
        currentHat.position.set(seagull.position.x, 0.1, seagull.position.z);
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
        npcs.forEach(function (npc) {
            if (npc.hat) {
                const distance = seagull.position.distanceTo(npc.position);
                if (distance < 3) {
                    npc.remove(npc.hat);
                    currentHat = npc.hat;
                    currentHat.position.set(0, 0.4, 0);
                    seagull.add(currentHat);
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
            const distance = seagull.position.distanceTo(hat.position);
            if (distance < 3) {
                scene.remove(hat);
                delete groundHats[hatId];
                currentHat = hat;
                currentHat.position.set(0, 0.4, 0);
                seagull.add(currentHat);
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ pickHat: { hatId: hatId } }));
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

    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    for (let id in otherPlayers) {
        if (otherPlayers[id].mixer) otherPlayers[id].mixer.update(delta);
    }

    if (seagull) {
        seagull.rotation.order = 'YXZ';
        seagull.rotation.y = yaw;
        seagull.rotation.x = pitch;

        const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(seagull.quaternion);
        const sideDirection = new THREE.Vector3(-1, 0, 0).applyQuaternion(seagull.quaternion);
        const newPosition = seagull.position.clone();

        if (moveForward) newPosition.addScaledVector(direction, speed);
        if (moveBackward) newPosition.addScaledVector(direction, -speed);
        if (moveLeft) newPosition.addScaledVector(sideDirection, speed);
        if (moveRight) newPosition.addScaledVector(sideDirection, -speed);

        if (newPosition.y >= 0.5 && !checkCollision(newPosition, 0.3, 0.2, 0.5)) {
            seagull.position.copy(newPosition);
        }
        if (seagull.position.y < 0.5) seagull.position.y = 0.5;

        velocity.subVectors(seagull.position, lastPosition).divideScalar(delta || 0.016);
        lastPosition.copy(seagull.position);

        const speedMagnitude = velocity.length();
        const minFlapSpeed = 0.5;
        const maxFlapSpeed = 2;
        const flapSpeed = THREE.MathUtils.lerp(minFlapSpeed, maxFlapSpeed, Math.min(speedMagnitude / speed, 1));
        if (mixer) mixer.timeScale = flapSpeed;

        const cameraOffset = new THREE.Vector3(0, 2, 4);
        cameraOffset.applyQuaternion(seagull.quaternion);
        camera.position.copy(seagull.position).add(cameraOffset);
        camera.quaternion.copy(seagull.quaternion);

        if (socket.readyState === WebSocket.OPEN) {
            const state = {
                position: { x: seagull.position.x, y: seagull.position.y, z: seagull.position.z },
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
    }

    npcs.forEach(function (npc) {
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

    cars.forEach(function (car) {
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

    poops.forEach(function (poop, index) {
        poop.velocity.add(poop.acceleration);
        poop.position.add(poop.velocity);
        if (poop.position.y < 0) {
            scene.remove(poop);
            poops.splice(index, 1);
        } else {
            npcs.forEach(function (npc) {
                const distance = poop.position.distanceTo(npc.position);
                if (distance < 1 && !npc.pooped) {
                    npc.children[0].material.color.set(0x654321);
                    npc.pooped = true;
                    poopCount++;
                    poopCounter.textContent = 'People Pooped On: ' + poopCount;
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