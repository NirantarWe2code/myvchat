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
uvicorn app.main:app --reload
```

### Start Frontend

```bash
cd vdo-app/frontend
npm start
```

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

[MIT](https://choosealicense.com/licenses/mit/)
