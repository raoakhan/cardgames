# Getting Started with Card Games Web App

This guide will walk you through the steps to set up and run the Card Games web application locally.

## Prerequisites

### Backend (Django)
- Python 3.8+ installed
- Pip package manager
- (Optional) PostgreSQL for production deployment
- (Optional) Redis for production WebSocket support

### Frontend (Angular)
- Node.js 16+ installed
- npm package manager
- Angular CLI (`npm install -g @angular/cli`)

## Setting Up the Development Environment

### 1. Backend Setup (Django)

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv env

# Activate the virtual environment
# On Windows:
env\Scripts\activate
# On macOS/Linux:
# source env/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from example
cp .env.example .env
# Edit .env with your specific settings

# Run migrations
python manage.py migrate

# Create a superuser (optional)
python manage.py createsuperuser

# Start the Django dev server
python manage.py runserver
```

The Django API will be available at http://localhost:8000/

### 2. Frontend Setup (Angular)

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Angular dev server
ng serve
```

The Angular app will be available at http://localhost:4200/

## Development Workflow

### Backend Development

- Models are defined in `backend/games/models.py`
- API endpoints are in `backend/api/views.py`
- WebSocket consumers are in `backend/games/consumers.py` and `backend/chat/consumers.py`

### Frontend Development

- Core services are in `frontend/src/app/core/services/`
- Game components are in `frontend/src/app/pages/game-room/`
- Reusable UI components are in `frontend/src/app/shared/components/`

## Floating Mini-Player Feature

The floating mini-player is a unique feature of this app that allows users to:

1. Watch YouTube videos while playing
2. View news feeds in real-time
3. Position the player anywhere on screen
4. Resize as needed

To use it:
- Click the "picture-in-picture" icon in the game room
- Select content from the dropdown menu
- Drag the player to position it
- Resize using the corner handle

## WebSocket Communication

This app uses Django Channels for WebSocket communication:
- Game state updates are sent/received via `/ws/game/<room_id>/`
- Chat messages are sent/received via `/ws/chat/<room_id>/`

## Video/Audio Chat Integration

Video and audio chat are implemented using a third-party WebRTC provider:
1. Configure your provider API key in the `.env` file
2. The integration happens in the game room component

## Troubleshooting

### Common Backend Issues
- **Database migrations failing**: Make sure your database user has the necessary permissions
- **WebSocket connection failing**: Ensure ASGI is configured properly

### Common Frontend Issues
- **CORS errors**: Ensure the Django backend has the frontend URL in the `CORS_ALLOWED_ORIGINS` setting
- **WebSocket connection issues**: Check that the WebSocket URL is correct for your environment
