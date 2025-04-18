import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uuid
import json
import os
import logging
from dotenv import load_dotenv

# Configure more detailed logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('websocket_debug.log')
    ]
)
logger = logging.getLogger(__name__)

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
    
    logger.info(f"New WebSocket connection for room: {room_id}")
    
    # Create room if it doesn't exist
    if room_id not in rooms:
        rooms[room_id] = {
            'connections': {},
            'messages': []
        }
    
    # Unique user ID for this connection
    user_id = None
    
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                logger.debug(f"Received message in room {room_id}: {message}")
            except json.JSONDecodeError:
                logger.error(f"Invalid JSON received: {data}")
                continue
            
            # Handle different message types
            if message.get('type') == 'join_room':
                user_id = message.get('userId')
                
                # Add connection to room
                rooms[room_id]['connections'][user_id] = websocket
                
                logger.info(f"User {user_id} joined room {room_id}")
                
                # Broadcast updated participant list
                participants = list(rooms[room_id]['connections'].keys())
                broadcast_message = {
                    'type': 'room_participants',
                    'participants': participants
                }
                
                for participant_id, conn in rooms[room_id]['connections'].items():
                    try:
                        await conn.send_text(json.dumps(broadcast_message))
                        logger.debug(f"Sent participant list to {participant_id}")
                    except Exception as e:
                        logger.error(f"Error broadcasting to {participant_id}: {e}")
            
            elif message.get('type') in ['offer', 'answer', 'ice-candidate', 'chat']:
                # Broadcast to all other connections in the room
                logger.debug(f"Broadcasting {message.get('type')} message in room {room_id}")
                
                broadcast_count = 0
                for other_user_id, conn in rooms[room_id]['connections'].items():
                    if other_user_id != user_id:
                        try:
                            await conn.send_text(json.dumps(message))
                            broadcast_count += 1
                            logger.debug(f"Sent message to {other_user_id}")
                        except Exception as e:
                            logger.error(f"Error sending to {other_user_id}: {e}")
                
                logger.info(f"Message broadcast to {broadcast_count} other users")
                
                # Store chat messages
                if message.get('type') == 'chat':
                    rooms[room_id]['messages'].append(message)
                    logger.info(f"Chat message stored. Total messages in room: {len(rooms[room_id]['messages'])}")
    
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for user {user_id} in room {room_id}")
        
        # Remove this connection from the room
        if user_id and room_id in rooms:
            if user_id in rooms[room_id]['connections']:
                del rooms[room_id]['connections'][user_id]
            
            # Broadcast updated participant list
            participants = list(rooms[room_id]['connections'].keys())
            for conn in rooms[room_id]['connections'].values():
                try:
                    await conn.send_text(json.dumps({
                        'type': 'room_participants',
                        'participants': participants
                    }))
                except Exception as e:
                    logger.error(f"Error broadcasting participant update: {e}")
            
            # If no more connections, optionally clean up the room
            if not rooms[room_id]['connections']:
                del rooms[room_id]
    
    except Exception as e:
        logger.error(f"Unexpected error in WebSocket handler: {e}")
        
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