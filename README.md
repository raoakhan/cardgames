# Card Games Web App
<!-- TODO: Update these badge URLs with your actual GitHub repo path -->
![CI](https://github.com/your-org/card-games/actions/workflows/ci.yml/badge.svg) ![License](https://img.shields.io/github/license/your-org/card-games)

A modern, mobile-friendly web application for playing classic card games with friends, featuring real-time multiplayer gameplay, integrated video/audio/text chat, and a unique floating mini-player for multitasking (watching news, YouTube, or other services) while playing.

---

## Table of Contents
- [Overview](#overview)
- [Reference Websites](#reference-websites)
- [Features](#features)
- [Your Unique Ideas](#your-unique-ideas)
- [Tech Stack Details](#tech-stack-details)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Environment Variables](#environment-variables)
- [Software Engineering Design Patterns & Principles](#software-engineering-design-patterns--principles)
- [Getting Started](#getting-started)
- [Testing](#testing)
- [MVP Roadmap](#mvp-roadmap)
- [Deployment](#deployment)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Overview
This project aims to deliver a next-generation card games platform where users can:
- Enjoy classic card games (e.g., Solitaire, Hearts, Spades) in a responsive, visually appealing environment.
- Play with friends in real-time, with seamless video, audio, and text chat.
- Multitask by watching news, YouTube, or other embeddable services in a floating, movable mini-player while playing.
- Experience a distraction-free, mobile-first UI with modern design and accessibility options.

---

## Reference Websites
For inspiration and to refine ideas, the following card game web apps were reviewed:

- [CardGames.io](https://cardgames.io/) — Large collection of classic card games with a simple, responsive UI.
- [Solitaired](https://www.solitaired.com/) — Modern solitaire and card games site with daily challenges and leaderboards.
- [World of Card Games](https://www.worldofcardgames.com/) — Multiplayer classic card games with guest and account options.
- [PlayingCards.io](https://playingcards.io/) — Customizable virtual card table for real-time play with friends.
- [247 Games](https://www.247solitaire.com/) — Fast-loading, mobile-friendly classic card games.

---

## Features
- **Classic Card Games:** Play popular games like Solitaire, Hearts, Spades, and more.
- **Responsive Design:** Optimized for desktop, tablet, and mobile devices.
- **Real-Time Multiplayer:** Join or create game rooms, invite friends, and play together.
- **Integrated Communication:** Video, audio, and text chat available within each game room.
- **Floating Mini-Player:** Draggable and resizable window to watch news, YouTube, or other services while playing.
- **Game Rules & Instructions:** Access rules and tutorials directly in-game.
- **No Registration Required:** Play as a guest, with optional account creation for persistent stats (future).
- **Light/Dark Mode:** Toggle between light and dark themes.
- **Sound Effects:** In-game sounds with mute option.
- **Bots:** Fill empty seats with bots if needed (optional for MVP).

---

## Your Unique Ideas
- **Multitasking Experience:** Users can switch between watching real-world news, YouTube, or other services in a floating mini-player, enabling them to play and consume content simultaneously.
- **Floating Mini-Player:** The mini-player can be moved or resized anywhere on the screen and remains on top of the game area. Users can minimize, mute, or close it at any time.
- **Service Flexibility:** Support for multiple content sources—news feeds, YouTube, and potentially Twitch or other embeddable services.
- **Customizable Experience:** Users can choose which type of content to view, or hide the mini-player entirely for a focused gaming session.
- **Non-Intrusive Design:** The mini-player is designed to never block critical gameplay elements and is fully responsive.

---

## Tech Stack Details

### Frontend
- **Angular**: Provides a powerful, structured framework for building large-scale, maintainable single-page applications. Its strong typing and modularity help manage complex UI logic and state.
- **Angular Material / Tailwind CSS**: Ensures a modern, responsive, and accessible user interface with ready-to-use components and utility classes.
- **@angular/cdk/drag-drop**: Enables intuitive drag-and-drop and resizable UI for the floating mini-player and card interactions.
- **YouTube IFrame API & Embeddable Services**: Allows seamless integration of third-party content (YouTube, news, etc.) within the app.
- **WebRTC (via third-party APIs)**: Supports real-time video and audio chat for multiplayer rooms.

### Backend
- **Django**: A robust, secure, and scalable backend framework with a mature ORM and built-in admin tools.
- **Django REST Framework**: Facilitates the creation of RESTful APIs for frontend-backend communication.
- **Django Channels**: Adds WebSocket support for real-time features such as multiplayer game state sync and chat.

### Deployment & Infrastructure
- **Vercel/Netlify**: Fast, reliable hosting for the Angular frontend, with automatic CI/CD.
- **Heroku/DigitalOcean**: Scalable hosting for the Django backend, with easy environment management.
- **(Optional) Redis**: For scalable session, cache, and real-time message management.

---

## Architecture
A high-level overview of the system:

```
Browser (Angular SPA)
    │  REST (HTTPS)
    │  WebSocket (WSS)
    ▼
Django REST API  ───►  PostgreSQL
    │
    └── Django Channels  ⇄  Redis (Pub/Sub)
```

• **Data Flow (gameplay)**: A player action is sent over WebSocket → Django Channels validates and updates state → broadcasts to other players in the room.
• **Video/Audio**: WebRTC handled client-side via third-party provider (Daily/Twilio). Only signaling metadata passes through that provider’s servers.

## Folder Structure
```
card-games/
├── frontend/      # Angular project
│   └── src/
├── backend/       # Django project
│   ├── cardgames/
│   └── manage.py
├── docs/          # Architecture diagrams, ADRs
├── scripts/       # Dev & deploy helpers
└── README.md
```

## Environment Variables
Create a `.env` (backend) and `.env.frontend` (Angular) with at least:

| Variable | Example | Description |
|----------|---------|-------------|
| `DJANGO_SECRET_KEY` | `changeme` | Django cryptographic key |
| `DATABASE_URL` | `postgres://user:pass@localhost:5432/cardgames` | Postgres connection |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis for Channels/caching |
| `YOUTUBE_API_KEY` | `AIza...` | Embed/metadata requests |
| `NEWS_API_KEY` | `abcdefghijklmnopqrstuvwxyz` | News API access |
| `DAILY_API_KEY` | `abcdefg` | Video chat provider |

---

## Software Engineering Design Patterns & Principles
<!-- Consider moving detailed principles to a separate docs/DESIGN_PRINCIPLES.md if this section becomes too long -->
To ensure scalability, robustness, and maintainability, the following design patterns and principles are recommended:

### General Principles
- **Separation of Concerns**: Keep frontend, backend, and real-time logic modular and independent.
- **Single Responsibility Principle (SRP)**: Each component, service, or module should do one thing well.
- **DRY (Don't Repeat Yourself)**: Reuse code via shared modules, services, and utility functions.
- **KISS (Keep It Simple, Stupid)**: Avoid unnecessary complexity in both UI and backend logic.
- **YAGNI (You Aren't Gonna Need It)**: Only implement features when they are actually needed.
- **SOLID Principles**: Especially important for backend models, services, and Angular services/components.

### Frontend Patterns
- **Component-Based Architecture**: Use Angular’s component system to encapsulate UI and logic.
- **State Management**: Use Angular services or libraries (like NgRx) for predictable and scalable state management.
- **Observer Pattern**: For real-time updates (WebSockets, RxJS observables).
- **Facade Pattern**: Expose simplified APIs for complex subsystems (e.g., a game service that wraps all game-related logic).

### Backend Patterns
- **MVC (Model-View-Controller)**: Django’s core architecture supports this pattern for clean separation.
- **Repository Pattern**: Encapsulate database access logic, making it easier to swap or refactor storage.
- **Pub/Sub Pattern**: For real-time events and notifications (using Django Channels and Redis).
- **Service Layer**: Encapsulate business logic in services, not in views or models.

### Real-Time & Communication
- **WebSockets for Real-Time**: Use Django Channels for low-latency, bidirectional communication.
- **API Versioning**: Plan for future changes by versioning REST APIs.
- **Graceful Error Handling**: Robust error handling and user feedback for all network operations.

### Scalability & Robustness
- **Stateless Backend**: Design APIs and WebSocket handlers to be stateless where possible for easier scaling.
- **Caching**: Use Redis or similar for caching frequently accessed data.
- **Horizontal Scaling**: Ensure backend can be scaled out with load balancers.
- **Automated Testing**: Unit, integration, and end-to-end tests for critical logic and flows.
- **CI/CD Pipelines**: Automated deployment and testing for both frontend and backend.

### Security
- **Input Validation & Sanitization**: On both frontend and backend.
- **Authentication & Authorization**: JWT or session-based, with role-based access control for sensitive actions.
- **Rate Limiting & Anti-Cheat**: Protect APIs and game logic from abuse.
- **Secure WebSocket Connections**: Use WSS in production.

---

## Getting Started
1. Clone the repositories for both frontend (Angular) and backend (Django).
2. **Backend Setup (Django):**
   ```bash
   cd backend
   python -m venv env # Or python3 -m venv env
   source env/bin/activate # On Windows: .\env\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env # Edit .env with your specific database URL, secret key, API keys, etc.
   python manage.py migrate
   ```
3. **Frontend Setup (Angular):**
   ```bash
   cd ../frontend
   npm install
   # If using environment variables for Angular, copy the example file:
   # cp .env.frontend.example .env.frontend
   ```
4. **Run the Application:**
   - Start Django Backend (from `backend` directory): `python manage.py runserver`
   - Start Angular Frontend (from `frontend` directory): `npm start` (Ensure Angular proxy is configured to talk to the backend API, or run backend on a different port).
5. Access the app in your browser (typically `http://localhost:4200` for Angular).

## Testing
- **Backend**: `pytest` with coverage; run `pytest -q`.
- **Frontend**: Angular’s Karma/Jasmine unit tests `ng test` and Cypress e2e `npm run cy:open`.
- **CI**: GitHub Actions workflow runs lint, tests, and builds on every PR.

---

## MVP Roadmap

### 1. Project Setup
- Initialize Angular and Django projects in separate repos or folders.
- Set up CORS and API communication between frontend and backend.

### 2. Core Game Logic
- Implement backend models/APIs for games, rooms, and player management (Django + DRF).
- Set up real-time game state sync with Django Channels (WebSockets).
- Build Angular components for lobby, game table, and card interactions.

### 3. Multiplayer & Chat
- Enable room creation/joining via invite links.
- Implement player synchronization and turn management.
- Add text chat using WebSockets.
- Integrate video/audio chat using a third-party service (Daily.co, Twilio, or LiveKit) in Angular.

### 4. Floating Mini-Player
- Create a draggable, resizable Angular component for the mini-player.
- Integrate YouTube IFrame API and embeddable news streams.
- Allow users to move, resize, mute, close, and switch content in the mini-player.

### 5. UI/UX Polish
- Apply responsive design with Angular Material or Tailwind CSS.
- Add light/dark mode toggle.
- Implement sound effects and mute option.
- Provide in-game rules and instructions.

### 6. Testing & Deployment
- Test on multiple devices/browsers.
- Deploy backend and frontend.
- Set up production environment variables and configurations.

---

## Deployment
| Target | Command / Action |
|--------|------------------|
| **Frontend Preview** | Automatic Netlify/Vercel deploy on every push to `main` and PR branches |
| **Backend** | Docker image built via GitHub Actions, deployed to Heroku/DigitalOcean App Platform |
| **Database Migrations** | `python manage.py migrate` run during release step |
| **Blue-Green / Preview** | Every PR spins up disposable review apps |

---

## Future Enhancements
- Persistent user accounts, statistics, and achievements
- More card games and custom game modes
- Advanced mini-player integrations (Twitch, custom feeds)
- Accessibility improvements (colorblind mode, keyboard navigation)
- PWA support for installable mobile experience

---

## Contributing
We welcome contributions!
1. Fork the repo and create a feature branch.
2. Follow the **Conventional Commits** style (`feat:`, `fix:`, etc.).
3. Ensure `npm test` and `pytest` pass.
4. Open a Pull Request. The CI must be green before review.
5. Please adhere to the project's Code of Conduct (add `CODE_OF_CONDUCT.md` if you create one).

---

## License
[MIT](LICENSE)
<!-- TODO: Ensure you have a LICENSE file in the root directory with the MIT license text -->

---

## Contact
For questions, suggestions, or to report issues, please open an issue on the project's GitHub repository.
