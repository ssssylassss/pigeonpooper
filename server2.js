const WebSocket = require('ws');

// Store game state
const players = {};
const npcs = {};
const groundHats = {};
let worldState = {};

// Generate consistent world state
function generateWorld() {
    const world = {
        buildings: [],
        roads: [],
        sidewalks: [],
        npcs: [],
        cars: []
    };
    const worldSize = 400;
    const roadWidth = 8;
    const sidewalkWidth = 3;

    // Buildings
    for (let i = 0; i < 200; i++) {
        const width = Math.random() * 10 + 4;
        const depth = Math.random() * 10 + 4;
        const height = Math.random() * 40 + 10;
        const colors = [0x8b4513, 0xa9a9a9, 0x4682b4, 0xdeb887];
        const posX = Math.random() * (worldSize - 40) - (worldSize / 2 - 20);
        const posZ = Math.random() * (worldSize - 40) - (worldSize / 2 - 20);
        let isValid = true;
        for (const road of world.roads) {
            if (road.isHorizontal) {
                if (Math.abs(posZ - road.z) < (roadWidth / 2 + depth / 2)) isValid = false;
            } else {
                if (Math.abs(posX - road.x) < (roadWidth / 2 + width / 2)) isValid = false;
            }
        }
        for (const sidewalk of world.sidewalks) {
            if (sidewalk.isHorizontal) {
                if (Math.abs(posZ - sidewalk.z) < (sidewalkWidth / 2 + depth / 2)) isValid = false;
            } else {
                if (Math.abs(posX - sidewalk.x) < (sidewalkWidth / 2 + width / 2)) isValid = false;
            }
        }
        if (isValid) {
            world.buildings.push({
                x: posX,
                y: height / 2,
                z: posZ,
                width,
                height,
                depth,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }
    }

    // Roads
    for (let x = -180; x <= 180; x += 40) {
        world.roads.push({ x: 0, z: x, isHorizontal: true });
        world.roads.push({ x: x, z: 0, isHorizontal: false });
        world.sidewalks.push({ x: 0, z: x + roadWidth / 2 + sidewalkWidth / 2, isHorizontal: true });
        world.sidewalks.push({ x: 0, z: x - roadWidth / 2 - sidewalkWidth / 2, isHorizontal: true });
        world.sidewalks.push({ x: x + roadWidth / 2 + sidewalkWidth / 2, z: 0, isHorizontal: false });
        world.sidewalks.push({ x: x - roadWidth / 2 - sidewalkWidth / 2, z: 0, isHorizontal: false });
    }

    // NPCs
    for (let i = 0; i < 50; i++) {
        const sidewalk = world.sidewalks[Math.floor(Math.random() * world.sidewalks.length)];
        const posX = sidewalk.isHorizontal ? Math.random() * (worldSize - 40) - (worldSize / 2 - 20) : sidewalk.x;
        const posZ = sidewalk.isHorizontal ? sidewalk.z : Math.random() * (worldSize - 40) - (worldSize / 2 - 20);
        world.npcs.push({
            x: posX,
            y: 0.75,
            z: posZ,
            isHorizontal: sidewalk.isHorizontal,
            sidewalkPos: sidewalk.isHorizontal ? sidewalk.z : sidewalk.x,
            direction: Math.random() < 0.5 ? 1 : -1,
            speed: 0.05 + Math.random() * 0.03,
            id: `npc_${i}`
        });
    }

    // Cars
    for (let i = 0; i < 20; i++) {
        const road = world.roads[Math.floor(Math.random() * world.roads.length)];
        world.cars.push({
            x: road.isHorizontal ? Math.random() * (worldSize - 40) - (worldSize / 2 - 20) : road.x,
            y: 0.5,
            z: road.isHorizontal ? road.z : Math.random() * (worldSize - 40) - (worldSize / 2 - 20),
            isHorizontal: road.isHorizontal,
            roadPos: road.isHorizontal ? road.z : road.x,
            direction: Math.random() < 0.5 ? 1 : -1,
            speed: 0.2,
            color: Math.floor(Math.random() * 0xffffff)
        });
    }

    return world;
}

// Initialize world state once
worldState = generateWorld();
for (const npc of worldState.npcs) {
    npcs[npc.id] = npc;
}

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    const playerId = Date.now().toString() + Math.random().toString(36).substr(2, 5); // Unique ID
    players[playerId] = { x: 0, y: 5, z: 0 };

    // Send initial state with player ID, world, and join message
    ws.send(JSON.stringify({ id: playerId, world: worldState }));
    broadcast({ join: playerId }, ws);

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        // Player position and hat state
        if (data.position) {
            players[playerId] = {
                x: data.position.x,
                y: data.position.y,
                z: data.position.z,
                yaw: data.yaw || 0
            };
            if (data.hat) {
                players[playerId].hat = data.hat;
            } else if (players[playerId].hat) {
                delete players[playerId].hat;
            }
        }

        // Customization
        if (data.customization) {
            players[playerId].customization = data.customization;
        }

        // Single poop
        if (data.poop) {
            broadcast({ poop: data.poop }, ws);
        }

        // Diarrhea spray
        if (data.diarrhea) {
            broadcast({ diarrhea: data.diarrhea }, ws);
        }

        // Hat actions
        if (data.stealHat) {
            const npcId = data.stealHat.npcId;
            if (npcs[npcId] && npcs[npcId].hat) {
                players[playerId].hat = npcs[npcId].hat;
                delete npcs[npcId].hat;
                broadcastState();
            }
        }

        if (data.dropHat) {
            const hatData = data.dropHat;
            groundHats[hatData.id] = {
                x: hatData.x,
                y: hatData.y,
                z: hatData.z,
                width: hatData.width,
                height: hatData.height,
                depth: hatData.depth,
                color: hatData.color
            };
            if (players[playerId].hat) {
                delete players[playerId].hat;
            }
            broadcastState();
        }

        if (data.pickHat) {
            const hatId = data.pickHat.hatId;
            if (groundHats[hatId]) {
                players[playerId].hat = groundHats[hatId];
                delete groundHats[hatId];
                broadcastState();
            }
        }

        // Poop hit
        if (data.poopHit) {
            const npcId = data.poopHit.npcId;
            if (npcs[npcId]) {
                npcs[npcId].pooped = true;
                npcs[npcId].pooper = data.poopHit.pooper;
                broadcastState();
            }
        }

        // Chat message
        if (data.chat) {
            broadcast({ chat: `Player ${playerId}: ${data.chat}` }, ws);
        }

        // Broadcast updated state
        broadcastState(ws);
    });

    ws.on('close', () => {
        delete players[playerId];
        broadcastState();
    });
});

function broadcastState(excludeWs = null) {
    const state = {
        players,
        npcs: Object.fromEntries(Object.entries(npcs).map(([id, npc]) => [id, {
            x: npc.x,
            y: npc.y,
            z: npc.z,
            rotationY: npc.rotationY || 0,
            hat: npc.hat || null,
            pooped: npc.pooped || false,
            pooper: npc.pooper || null
        }])),
        groundHats
    };
    const message = JSON.stringify(state);
    wss.clients.forEach(client => {
        if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

function broadcast(message, excludeWs = null) {
    const msg = JSON.stringify(message);
    wss.clients.forEach(client => {
        if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
            client.send(msg);
        }
    });
}

console.log("WebSocket server running on ws://localhost:8080");