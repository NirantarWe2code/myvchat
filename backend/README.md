# Backend Setup Guide

## Prerequisites

- Python 3.8+
- pip
- virtualenv (optional but recommended)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd vdo-app/backend
```

### 2. Create Virtual Environment

```bash
# Windows
python -m venv venv

# macOS/Linux
python3 -m venv venv
```

### 3. Activate Virtual Environment

```bash
# Windows (PowerShell)
.\venv\Scripts\Activate

# Windows (Command Prompt)
venv\Scripts\activate.bat

# macOS/Linux
source venv/bin/activate
```

### 4. Install Dependencies

```bash
# Upgrade pip
python -m pip install --upgrade pip

# Install requirements
pip install -r requirements.txt
```

### 5. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```
# Server Configuration
APP_HOST=0.0.0.0
APP_PORT=8000

# WebSocket Configuration
WEBSOCKET_HOST=0.0.0.0
WEBSOCKET_PORT=8001

# CORS Configuration
ALLOWED_ORIGINS=["http://localhost:3000", "http://127.0.0.1:3000"]

# Logging Level
LOG_LEVEL=INFO
```

### 6. Run the Backend Server

```bash
# Using Uvicorn with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Alternative: Specify WebSocket port
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 --ws-host 0.0.0.0 --ws-port 8001
```

## Development Workflow

### Activate Virtual Environment

Always activate the virtual environment before working:

```bash
# Windows
.\venv\Scripts\Activate

# macOS/Linux
source venv/bin/activate
```

### Install New Packages

```bash
pip install <package-name>
pip freeze > requirements.txt
```

### Deactivate Virtual Environment

```bash
deactivate
```

## Troubleshooting

### Common Issues

- Ensure Python version compatibility
- Check that all dependencies are installed
- Verify `.env` file configuration
- Confirm correct virtual environment activation

### Debugging

- Use `print()` statements or logging
- Check server logs for detailed error information
- Verify network configurations

## Testing

```bash
# Run tests (if configured)
pytest

# Run specific test module
pytest tests/test_module.py
```

## Deployment Considerations

- Use a production WSGI server like Gunicorn
- Set up proper environment variables
- Configure logging and monitoring

## Contributing

- Follow PEP 8 style guidelines
- Write unit tests for new features
- Update documentation

## License

[Specify your project's license]
