import asyncio
import websockets
import json
import random

# Store game state
players = {}
npcs = {}
ground_hats = {}
world_state = {}

# Generate consistent world state
def generate_world():
    world = {
        "buildings": [],
        "roads": [],
        "sidewalks": [],
        "npcs": [],
        "cars": []
    }
    world_size = 400
    road_width = 8
    sidewalk_width = 3

    # Buildings
    for i in range(200):
        width = random.uniform(4, 14)
        depth = random.uniform(4, 14)
        height = random.uniform(10, 50)
        colors = [0x8b4513, 0xa9a9a9, 0x4682b4, 0xdeb887]
        pos_x = random.uniform(-world_size / 2 + 20, world_size / 2 - 20)
        pos_z = random.uniform(-world_size / 2 + 20, world_size / 2 - 20)
        is_valid = True
        for road in world["roads"]:
            if road["isHorizontal"]:
                if abs(pos_z - road["z"]) < (road_width / 2 + depth / 2):
                    is_valid = False
            else:
                if abs(pos_x - road["x"]) < (road_width / 2 + width / 2):
                    is_valid = False
        for sidewalk in world["sidewalks"]:
            if sidewalk["isHorizontal"]:
                if abs(pos_z - sidewalk["z"]) < (sidewalk_width / 2 + depth / 2):
                    is_valid = False
            else:
                if abs(pos_x - sidewalk["x"]) < (sidewalk_width / 2 + width / 2):
                    is_valid = False
        if is_valid:
            world["buildings"].append({
                "x": pos_x,
                "y": height / 2,
                "z": pos_z,
                "width": width,
                "height": height,
                "depth": depth,
                "color": random.choice(colors)
            })

    # Roads
    for x in range(-180, 181, 40):
        world["roads"].append({"x": 0, "z": x, "isHorizontal": True})
        world["roads"].append({"x": x, "z": 0, "isHorizontal": False})
        world["sidewalks"].append({"x": 0, "z": x + road_width / 2 + sidewalk_width / 2, "isHorizontal": True})
        world["sidewalks"].append({"x": 0, "z": x - road_width / 2 - sidewalk_width / 2, "isHorizontal": True})
        world["sidewalks"].append({"x": x + road_width / 2 + sidewalk_width / 2, "z": 0, "isHorizontal": False})
        world["sidewalks"].append({"x": x - road_width / 2 - sidewalk_width / 2, "z": 0, "isHorizontal": False})

    # NPCs
    for i in range(50):
        sidewalk = random.choice(world["sidewalks"])
        pos_x = random.uniform(-world_size / 2 + 20, world_size / 2 - 20) if sidewalk["isHorizontal"] else sidewalk["x"]
        pos_z = sidewalk["z"] if sidewalk["isHorizontal"] else random.uniform(-world_size / 2 + 20, world_size / 2 - 20)
        world["npcs"].append({
            "x": pos_x,
            "y": 0.75,
            "z": pos_z,
            "isHorizontal": sidewalk["isHorizontal"],
            "sidewalkPos": sidewalk["z"] if sidewalk["isHorizontal"] else sidewalk["x"],  # Fixed syntax
            "direction": random.choice([1, -1]),
            "speed": random.uniform(0.05, 0.08),
            "id": f"npc_{i}"
        })

    # Cars
    for i in range(20):
        road = random.choice(world["roads"])
        world["cars"].append({
            "x": random.uniform(-world_size / 2 + 20, world_size / 2 - 20) if road["isHorizontal"] else road["x"],
            "y": 0.5,
            "z": road["z"] if road["isHorizontal"] else random.uniform(-world_size / 2 + 20, world_size / 2 - 20),
            "isHorizontal": road["isHorizontal"],
            "roadPos": road["z"] if road["isHorizontal"] else road["x"],  # Fixed syntax
            "direction": random.choice([1, -1]),
            "speed": 0.2,
            "color": random.randint(0, 0xffffff)
        })

    return world

# Initialize world state once
world_state = generate_world()
for npc in world_state["npcs"]:
    npcs[npc["id"]] = npc

async def handle_client(websocket, path):
    player_id = str(id(websocket))
    players[player_id] = {"x": 0, "y": 5, "z": 0}
    
    # Send initial state with player ID, world, and join message
    await websocket.send(json.dumps({"id": player_id, "world": world_state}))
    await broadcast({"join": player_id})

    try:
        async for message in websocket:
            data = json.loads(message)
            
            # Player position and hat state
            if "position" in data:
                players[player_id] = {
                    "x": data["position"]["x"],
                    "y": data["position"]["y"],
                    "z": data["position"]["z"],
                    "yaw": data.get("yaw", 0)
                }
                if "hat" in data:
                    players[player_id]["hat"] = data["hat"]
                elif "hat" not in players[player_id]:
                    players[player_id].pop("hat", None)

            # Customization
            if "customization" in data:
                players[player_id]["customization"] = data["customization"]

            # Single poop
            if "poop" in data:
                await broadcast({"poop": data["poop"]})

            # Diarrhea spray
            if "diarrhea" in data:
                await broadcast({"diarrhea": data["diarrhea"]})

            # Hat actions
            if "stealHat" in data:
                npc_id = data["stealHat"]["npcId"]
                if npc_id in npcs and "hat" in npcs[npc_id]:
                    npc_data = npcs[npc_id]
                    players[player_id]["hat"] = {
                        "width": npc_data["hat"]["width"],
                        "height": npc_data["hat"]["height"],
                        "depth": npc_data["hat"]["depth"],
                        "color": npc_data["hat"]["color"]
                    }
                    del npcs[npc_id]["hat"]
                    await broadcast_state()

            if "dropHat" in data:
                hat_data = data["dropHat"]
                ground_hats[hat_data["id"]] = {
                    "x": hat_data["x"],
                    "y": hat_data["y"],
                    "z": hat_data["z"],
                    "width": hat_data["width"],
                    "height": hat_data["height"],
                    "depth": hat_data["depth"],
                    "color": hat_data["color"]
                }
                if "hat" in players[player_id]:
                    del players[player_id]["hat"]
                await broadcast_state()

            if "pickHat" in data:
                hat_id = data["pickHat"]["hatId"]
                if hat_id in ground_hats:
                    players[player_id]["hat"] = ground_hats[hat_id]
                    del ground_hats[hat_id]
                    await broadcast_state()

            # Poop hit
            if "poopHit" in data:
                npc_id = data["poopHit"]["npcId"]
                if npc_id in npcs:
                    npcs[npc_id]["pooped"] = True
                    npcs[npc_id]["pooper"] = data["poopHit"]["pooper"]
                    await broadcast_state()

            # Chat message
            if "chat" in data:
                await broadcast({"chat": f"Player {player_id}: {data['chat']}"})

            # Broadcast updated state
            await broadcast_state(exclude=websocket)

    except websockets.ConnectionClosed:
        del players[player_id]
        await broadcast_state()

async def broadcast_state(exclude=None):
    state = {
        "players": players,
        "npcs": {id: {
            "x": npc["x"],
            "y": npc["y"],
            "z": npc["z"],
            "rotationY": npc.get("rotationY", 0),
            "hat": npc.get("hat"),
            "pooped": npc.get("pooped", False),
            "pooper": npc.get("pooper")
        } for id, npc in npcs.items()},
        "groundHats": ground_hats
    }
    message = json.dumps(state)
    await asyncio.gather(
        *[client.send(message) for client in websockets_clients if client != exclude and client.open]
    )

async def broadcast(message):
    await asyncio.gather(
        *[client.send(json.dumps(message)) for client in websockets_clients if client.open]
    )

# List to keep track of all connected clients
websockets_clients = set()

async def main():
    async with websockets.serve(handle_client, "localhost", 8080) as server:
        server.clients = websockets_clients
        print("WebSocket server running on ws://localhost:8080")
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())