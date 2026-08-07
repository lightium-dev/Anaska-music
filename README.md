# Anaska

# 1. Project Overview

**Project Name:** Anaska

**Project Type:** Full-stack mobile music streaming and conversational AI application.

## Description

Anaska is an intelligent mobile platform inspired by Spotify and YouTube Music, combining dynamic genre-based track streaming with an embedded AI music assistant ("DJ Muse") that communicates in real time via streaming responses and RAG capabilities.

---

# 2. Objectives

- Provide a seamless audio streaming experience featuring a global music player with playback controls and progress scrubbing.
- Enable user personalization through an onboarding profile setup with genre preferences validated by Zod schemas.
- Integrate an intelligent AI conversational agent to discuss music history, artist trivia, and recommendations with persistent chat history.
- Structure a robust full-stack architecture separating a Node.js/Express backend and an Expo/React Native mobile frontend.
- Comply with strict academic standards including secure JWT authentication, data validation, state management, and Docker containerization.

---

# 3. Target Audience

Anaska is designed for users who enjoy music, mobile technology, and AI curation.

Target users include:

- Music enthusiasts and everyday listeners looking for a sleek, dark-mode streaming experience.
- Students and developers exploring full-stack mobile applications with integrated LLM features.
- Tech-forward users interested in AI-driven music curation and conversational recommendations.
- Fans of specific alternative, rock, and electronic music genres seeking tailored track discovery.

---

# 4. Core Features

## 4.1 Onboarding & Profile Setup

Users can:

- Input a custom username.
- Select interactive music genres.
- Validate data via Zod schemas.
- Store preferences globally using Zustand.

---

## 4.2 Dynamic Music Feed & Player

Users can:

- Browse tracks fetched from a music backend.
- Control playback using a full-screen player interface.
- Manage audio using a mini player interface.
- Utilize playback controls and progress scrubbing.

---

## 4.3 AI Music Agent ("DJ Muse")

The integrated AI assistant provides intelligent conversation and context inside the app.

Users can:

- Use a dedicated chat interface supporting Server-Sent Events (SSE).
- View real-time text streaming.
- Receive context-aware responses regarding music history and artist trivia.

---

# 4.4 Secure Authentication & Routing

Users can:

- Access protected mobile routes.
- Perform JWT-based login and signup.
- Rely on password hashing with bcrypt.
- Benefit from centralized error management.
