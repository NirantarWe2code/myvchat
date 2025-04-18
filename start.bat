@echo off
start cmd /k "cd backend && venv\Scripts\activate && uvicorn app.main:app --reload"
start cmd /k "cd frontend && npm start"
echo Backend and Frontend servers started! 