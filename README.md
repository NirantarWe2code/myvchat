# 🎥 Video Call & Chat Application

## 🚀 Features

- Create unique video call rooms
- Real-time video and audio communication
- Text-based chat within rooms
- Mute/Unmute microphone
- Turn video on/off

## 🛠 Tech Stack

- Frontend: React.js, Tailwind CSS
- Backend: FastAPI, WebSocket
- WebRTC for peer-to-peer communication

## 📦 Prerequisites

- Node.js (v14+)
- Python (v3.9+)
- npm
- pip

## 🔧 Setup

### Backend Setup

1. Navigate to backend directory

```bash
cd vdo-app/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend Setup

1. Navigate to frontend directory

```bash
cd vdo-app/frontend
npm install
```

## 🏃‍♂️ Running the Application

### Start Backend

```bash
cd vdo-app/backend
uvicorn app.main:app --reload --port 8000
```

### Start Frontend

```bash
cd vdo-app/frontend
npm start  # Runs on port 3000
```

### WebSocket Server

- Backend API: `http://localhost:8000`
- WebSocket Server: `ws://localhost:8001`
- Frontend: `http://localhost:3000`

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

[MIT](https://choosealicense.com/licenses/mit/)

## 🔧 Environment Variables

### Backend Environment Variables (`.env`)

- `APP_HOST`: Host for the backend server (default: 0.0.0.0)
- `APP_PORT`: Port for the backend server (default: 8000)
- `APP_DEBUG`: Enable/disable debug mode
- `ALLOWED_ORIGINS`: List of allowed CORS origins
- `SECRET_KEY`: Secret key for security-related operations
- `DATABASE_URL`: Database connection string

### Frontend Environment Variables (`.env`)

- `REACT_APP_APP_NAME`: Name of the application
- `REACT_APP_API_BASE_URL`: Base URL for backend API
- `REACT_APP_WS_BASE_URL`: Base URL for WebSocket connections
- `REACT_APP_ENABLE_CHAT`: Enable/disable chat feature
- `REACT_APP_ENABLE_SCREEN_SHARING`: Enable/disable screen sharing

### Example `.env` Files

#### Backend `.env`

```bash
APP_HOST=0.0.0.0
APP_PORT=8000
ALLOWED_ORIGINS=["http://localhost:3000", "http://127.0.0.1:3000"]
```

#### Frontend `.env`

```bash
REACT_APP_APP_NAME=VDO Video Call App
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_WS_BASE_URL=ws://localhost:8000
REACT_APP_ENABLE_CHAT=true
```

**Note**: Never commit sensitive `.env` files to version control. They are already added to `.gitignore`.
