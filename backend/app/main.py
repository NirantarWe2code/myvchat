import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uuid
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS configuration from environment variables
ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', '["*"]')
ALLOWED_ORIGINS = eval(ALLOWED_ORIGINS)  # Convert string to list

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for rooms and connections
rooms = {}

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await websocket.accept()
    
    # Create room if it doesn't exist
    if room_id not in rooms:
        rooms[room_id] = {
            'connections': [],
            'messages': []
        }
    
    # Add this connection to the room
    rooms[room_id]['connections'].append(websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Broadcast message to all connections in the room
            for conn in rooms[room_id]['connections']:
                if conn != websocket:
                    await conn.send_text(json.dumps(message))
            
            # Store message in room history
            rooms[room_id]['messages'].append(message)
    
    except WebSocketDisconnect:
        # Remove this connection from the room
        rooms[room_id]['connections'].remove(websocket)
        
        # If no more connections, optionally clean up the room
        if not rooms[room_id]['connections']:
            del rooms[room_id]

@app.get("/create-room")
async def create_room():
    """Generate a unique room ID"""
    room_id = str(uuid.uuid4())
    return {"room_id": room_id}

if __name__ == "__main__":
    # Use environment variables for host and port
    host = os.getenv('APP_HOST', '0.0.0.0')
    port = int(os.getenv('APP_PORT', 8000))
    uvicorn.run(app, host=host, port=port) 