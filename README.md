# 🎵 Anaska — AI-Powered Music Streaming Platform

**Anaska** is a full-stack mobile music streaming app inspired by Spotify and YouTube Music. It features real-time audio playback, personalized genre onboarding, and an embedded AI music assistant (**"DJ Muse"**) that streams live recommendations and music trivia.

---

## 🏗️ Clean Project Architecture (Simple to Explain)

The codebase is organized into **two main micro-modules**:

```
Anaska-music/
├── 📱 mobile/      # React Native (Expo) Frontend Application
├── ⚙️ backend/     # Node.js + Express + TypeScript API Server
├── 📑 docs/        # Project Diagrams & Deployment Documentation
└── 🐳 docker-compose.yml
```

### 📱 1. Mobile Frontend (`/mobile`)

Built with **React Native & Expo**, following a standard **Layered / Feature-Based Architecture**:

```
mobile/src/
├── 🖼️ screens/      # Page-level UI screens
│   ├── HomeScreen.tsx         # Music feed & genre filters
│   ├── SearchScreen.tsx       # Track search & discovery
│   ├── ChatScreen.tsx         # DJ Muse AI chat interface
│   ├── ProfileScreen.tsx      # User profile & preferences
│   ├── PlayerScreen.tsx       # Full-screen audio player
│   ├── LoginScreen.tsx        # Authentication screen (Login / Signup)
│   ├── UsernameScreen.tsx     # Onboarding step 1: Username
│   └── GenreSelectScreen.tsx  # Onboarding step 2: Genre picker
│
├── 🧭 navigation/   # Root Navigation setup
│   └── RootNavigator.tsx      # Manages Auth -> Onboarding -> Main Tab flow
│
├── 📦 store/        # Global State Management (Zustand)
│   ├── userStore.ts           # Authentication token & profile state
│   └── playerStore.ts         # Audio playback, queue, and playback state
│
├── ⚡ services/     # API & Network Integration
│   ├── api.ts                 # Base HTTP request wrapper with JWT headers
│   ├── musicService.ts        # Music tracks & streaming endpoints
│   └── chatService.ts         # DJ Muse AI SSE (Server-Sent Events) streaming
│
├── 🎨 components/   # Reusable UI Elements
│   ├── MiniPlayer.tsx         # Bottom audio player bar
│   └── ErrorBoundary.tsx      # React error catch boundary
│
├── 🎨 constants/    # Global Design Tokens
│   └── theme.ts               # Colors, typography, spacing, border radii
│
└── 🛠️ utils/        # Validation & Helpers
    └── validators.ts          # Zod validation schemas for forms
```

### ⚙️ 2. Backend Service (`/backend`)

Built with **Node.js, Express & TypeScript**, following the **Controller-Service-Repository Pattern**:

```
backend/src/
├── 🎛️ controllers/  # HTTP Request Handlers
│   ├── authController.ts      # Handles login, signup, refresh token
│   ├── musicController.ts     # Handles track listing, streaming, recommendations
│   └── chatController.ts      # Handles DJ Muse AI chat stream (SSE)
│
├── 🧠 services/     # Core Business Logic & AI Integration
│   ├── AuthService.ts         # Password hashing (bcrypt) & JWT management
│   ├── MusicService.ts        # Music query logic & audio streaming metadata
│   └── AIAssistantService.ts  # DJ Muse LLM prompt engineering & SSE streaming
│
├── 🛣️ routes/       # Express API Route Declarations
│   ├── authRoutes.ts          # /api/auth endpoints
│   ├── musicRoutes.ts         # /api/music endpoints
│   └── chatRoutes.ts          # /api/chat endpoints
│
├── 🗄️ db/           # Database Layer & Seed Data
│   ├── memoryDb.ts            # Fallback zero-config in-memory database
│   ├── schema.sql             # PostgreSQL schema definition
│   └── seed.ts                # Initial mock music & user seed data
│
├── 🔒 middlewares/  # Express Middlewares
│   ├── auth.ts                # JWT authentication middleware
│   └── errorHandler.ts        # Global error handler
│
└── 📜 docs/         # Swagger OpenAPI Specifications
```

---

## 🎯 Simple Explanation of How the App Works (How to Explain in 30 Seconds)

1. **Authentication & Onboarding**:
   - The user opens the app -> `RootNavigator` checks `userStore` for auth tokens.
   - If unauthenticated, the user sees `LoginScreen`.
   - Once logged in, if onboarding is incomplete, the user is guided through `UsernameScreen` -> `GenreSelectScreen`.

2. **Music Streaming**:
   - `HomeScreen` fetches tracks via `musicService` -> `musicController` -> `MusicService`.
   - Audio state is managed globally by `playerStore`.
   - Clicking a track plays it, rendering `MiniPlayer` across all tabs and allowing full playback control in `PlayerScreen`.

3. **DJ Muse AI Assistant**:
   - The user opens `ChatScreen` to converse with DJ Muse.
   - The chat sends requests to `AIAssistantService`, which streams back real-time recommendations and music trivia via Server-Sent Events (SSE).

---

## 🚀 How to Run the App

### Prerequisites
- Node.js (v18+)
- Expo Go app on your phone OR Android/iOS Emulator

### 1. Start Backend API Server
```bash
cd backend
npm install
npm run dev
```
Backend runs on `http://localhost:5000` (Swagger docs available at `http://localhost:5000/api/docs`).

### 2. Start Mobile App
```bash
cd mobile
npm install
npm run dev
```
Scan the QR code in your terminal using the Expo Go app on your iOS or Android device.
