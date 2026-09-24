export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  genrePreferences: string[];
  createdAt: string;
}

export interface Genre {
  id: string;
  name: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  genreId: string;
  audioUrl: string;
  coverUrl: string;
  duration: number; // in seconds
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  startedAt: string;
}
