#!/bin/bash
# Start backend server
cd backend
source venv/bin/activate
uvicorn app.main:app --reload &

# Start frontend server
cd ../frontend
npm start &

echo "Backend and Frontend servers started!"
wait 