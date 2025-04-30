# Card Games Web App - Architecture Document

## System Architecture Diagram

```
┌───────────────────────────────┐       ┌─────────────────────────────┐
│                               │       │                             │
│ Angular Frontend (SPA)        │       │ Third-Party Services        │
│ ┌─────────────────────────┐   │       │ ┌─────────────────────────┐ │
│ │ Core                    │   │       │ │ YouTube API             │ │
│ │ - GameService           │   │       │ │ - Video Embedding       │ │
│ │ - ChatService           │   │       │ └─────────────────────────┘ │
│ │ - Models                │   │       │ ┌─────────────────────────┐ │
│ └─────────────────────────┘   │       │ │ News API                │ │
│ ┌─────────────────────────┐   │       │ │ - News Content          │ │
│ │ Pages                   │   │       │ └─────────────────────────┘ │
│ │ - Home                  │   │       │ ┌─────────────────────────┐ │
│ │ - Lobby                 │   │       │ │ WebRTC Provider         │ │
│ │ - GameRoom              │   │◄─────►│ │ (Daily.co/Twilio)       │ │
│ └─────────────────────────┘   │       │ │ - Video/Audio Chat      │ │
│ ┌─────────────────────────┐   │       │ └─────────────────────────┘ │
│ │ Shared                  │   │       │                             │
│ │ - FloatingPlayer        │   │       └─────────────────────────────┘
│ │ - CardComponents        │   │
│ └─────────────────────────┘   │
│                               │
└───────────┬───────────────────┘
            │ REST API & WebSockets
            ▼                                       ┌─────────────────┐
┌───────────────────────────────┐                   │                 │
│                               │                   │  PostgreSQL     │
│ Django Backend                │                   │  Database       │
│ ┌─────────────────────────┐   │                   │                 │
│ │ REST API                │   │                   └─────┬───────────┘
│ │ - Room Management       │   │◄──────┐                 │
│ │ - Game State            │   │       └─────────────────┘
│ └─────────────────────────┘   │
│ ┌─────────────────────────┐   │
│ │ Games App               │   │                   ┌─────────────────┐
│ │ - Game Logic            │   │                   │                 │
│ │ - Models                │   │                   │  Redis          │
│ └─────────────────────────┘   │                   │  Cache/PubSub   │
│ ┌─────────────────────────┐   │                   │                 │
│ │ WebSockets (Channels)   │   │◄──────┐           └─────┬───────────┘
│ │ - Game State Sync       │   │       └─────────────────┘
│ │ - Real-time Chat        │   │
│ └─────────────────────────┘   │
│                               │
└───────────────────────────────┘
```

## Component Interactions

### Game Flow

1. **User Creates/Joins Game**:
   - User creates a room through Angular UI
   - Angular sends REST request to Django
   - Django creates room entity in database
   - User is redirected to game room

2. **Game Room Connection**:
   - Frontend connects to WebSocket for real-time game updates
   - Frontend connects to WebSocket for chat functionality
   - WebRTC connection is established for video/audio (via third-party provider)

3. **Game Play**:
   - User actions (play card, draw card, etc.) are sent via WebSocket
   - Django validates actions and updates game state
   - Updated game state is broadcast to all players in room
   - Game state is persisted to database

4. **Floating Mini-Player**:
   - User can open the mini-player through UI control
   - Embedded content (YouTube, news) is loaded via respective APIs
   - Content plays while user continues their game

## Data Models

### Backend

1. **Room**
   - Represents a game room with unique ID and settings
   - Contains information about the game type and status

2. **Player**
   - Represents a user playing in a room
   - Links to User model (if authenticated) or stores guest name
   - Includes seat position and role (host/guest)

3. **GameSession**
   - Represents an active game being played
   - Stores current game state and turn information
   - Links to Room and tracks completion status

4. **GameAction**
   - Records individual game actions taken by players
   - Used for game history and potential replay functionality

### Frontend

1. **Room Interface**
   - Maps to backend Room model
   - Used for displaying and managing room info

2. **Player Interface**
   - Contains player information
   - Handles display name logic (authenticated vs guest)

3. **GameState Interface**
   - Represents current state of the game
   - Includes card positions, scores, current turn, etc.

## Communication Channels

1. **RESTful API**
   - Used for CRUD operations (create room, join room)
   - Handles authentication and initial data loading

2. **WebSockets**
   - Game state synchronization (card moves, turn changes)
   - In-game chat messages
   - Uses Django Channels with Redis backing

3. **WebRTC**
   - Direct peer-to-peer video/audio communication
   - Managed via third-party provider (Daily.co, Twilio)
   - Only signaling goes through the provider's servers

## Security Considerations

1. **Authentication**
   - JWT-based authentication for API requests
   - WebSocket authentication via token
   - Guest play supported with limited permissions

2. **Data Validation**
   - All game actions validated server-side
   - Input sanitization for chat messages
   - Rate limiting to prevent abuse

3. **CORS Configuration**
   - Restricted to frontend domain
   - WebSocket connections origin-checked

## Scalability Points

1. **Stateless Backend**
   - Game state stored in database/Redis, not in memory
   - Allows horizontal scaling of API servers

2. **Redis for WebSockets**
   - Enables multiple Channels instances to share state
   - Supports WebSocket clustering

3. **Database Scaling**
   - Read replicas for game history/statistics
   - Connection pooling for optimal performance
