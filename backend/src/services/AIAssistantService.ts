import { Response } from 'express';
import { pool } from '../db';

export interface ChatSessionRecord {
  id: string;
  user_id: string;
  started_at: Date;
}

export interface ChatMessageRecord {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: Date;
}

export class AIAssistantService {
  async getOrCreateSession(userId: string): Promise<ChatSessionRecord> {
    const existing = await pool.query<ChatSessionRecord>(
      'SELECT id, user_id, started_at FROM chat_sessions WHERE user_id = $1 ORDER BY started_at DESC LIMIT 1',
      [userId]
    );

    if (existing.rowCount && existing.rowCount > 0) {
      return existing.rows[0];
    }

    const created = await pool.query<ChatSessionRecord>(
      'INSERT INTO chat_sessions (user_id) VALUES ($1) RETURNING id, user_id, started_at',
      [userId]
    );
    return created.rows[0];
  }

  async getSessionMessages(sessionId: string): Promise<ChatMessageRecord[]> {
    const res = await pool.query<ChatMessageRecord>(
      'SELECT id, session_id, role, content, created_at FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC',
      [sessionId]
    );
    return res.rows;
  }

  async saveMessage(
    sessionId: string,
    role: 'user' | 'assistant' | 'system',
    content: string
  ): Promise<ChatMessageRecord> {
    const res = await pool.query<ChatMessageRecord>(
      'INSERT INTO chat_messages (session_id, role, content) VALUES ($1, $2, $3) RETURNING id, session_id, role, content, created_at',
      [sessionId, role, content]
    );
    return res.rows[0];
  }

  async getContext(query: string): Promise<string> {
    const keywords = query
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2);

    let knowledgeSnippet = '';
    let trackRecommendations = '';

    if (keywords.length > 0) {
      const searchTerms = `%${keywords.join('%')}%`;
      const kRes = await pool.query(
        `SELECT title, artist, genre, content FROM music_knowledge 
         WHERE LOWER(content) LIKE $1 OR LOWER(title) LIKE $1 OR LOWER(genre) LIKE $1 
         LIMIT 2`,
        [searchTerms]
      );

      if (kRes.rowCount && kRes.rowCount > 0) {
        knowledgeSnippet = kRes.rows
          .map((k) => `[Music Fact - ${k.title} (${k.genre})]: ${k.content}`)
          .join('\n');
      }

      const tRes = await pool.query(
        `SELECT title, artist, genre_id FROM tracks 
         WHERE LOWER(title) LIKE $1 OR LOWER(artist) LIKE $1 OR LOWER(genre_id) LIKE $1 
         LIMIT 3`,
        [searchTerms]
      );

      if (tRes.rowCount && tRes.rowCount > 0) {
        trackRecommendations = tRes.rows
          .map((t) => `• "${t.title}" by ${t.artist} (${t.genre_id})`)
          .join('\n');
      }
    }

    return [knowledgeSnippet, trackRecommendations].filter(Boolean).join('\n\n');
  }

  async streamResponse(
    sessionId: string,
    userMessage: string,
    res: Response
  ): Promise<void> {
    // 1. Save user message to database
    await this.saveMessage(sessionId, 'user', userMessage);

    // 2. Fetch context via RAG
    const ragContext = await this.getContext(userMessage);

    // 3. Set SSE HTTP headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // 4. Generate intelligent DJ Muse response
    let museReply = '';
    const q = userMessage.toLowerCase();

    if (q.includes('recommend') || q.includes('suggest') || q.includes('track') || q.includes('song')) {
      museReply = `Hey there! 🎧 DJ Muse here with your sonic prescription. Based on our catalog, check out:\n\n${
        ragContext || '• "Neon Horizon" by Cyberpulse (Synthwave)\n• "Rainy Cafe Study" by Coffee & Rain (Lo-Fi Chill)'
      }\n\nSink into the groove and let me know how that resonates!`;
    } else if (q.includes('lofi') || q.includes('chill') || q.includes('study')) {
      museReply = `Ah, craving that cozy warmth! ☕ Lo-fi hip hop combines tape-hiss warmth with jazzy chords designed for focus and calm. I suggest throwing on "Rainy Cafe Study" or "Golden Hour Dreams".`;
    } else if (q.includes('synthwave') || q.includes('retro') || q.includes('80s')) {
      museReply = `Turn the headlights on! 🏎️💨 Synthwave draws from 80s arcade nostalgia and lush analog synthesizers. Check out "Neon Horizon" by Cyberpulse or "Midnight Drive" by Vector Runner!`;
    } else if (q.includes('who are you') || q.includes('dj muse')) {
      museReply = `I am DJ Muse, your personal AI music curator in Anaska! 🎵 I can provide track recommendations, dive into music trivia, or match playlists to your current mood. What vibe are you after today?`;
    } else {
      museReply = `That's an interesting musical thought! ${
        ragContext ? `Here's a cool nugget from our archives:\n${ragContext}\n\n` : ''
      }I'm here to match you with sounds that elevate your flow. Want some synthwave rhythms or chill lo-fi beats?`;
    }

    // 5. Stream words/tokens via SSE with realistic chunking
    const chunks = museReply.match(/\S+\s*/g) || [museReply];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      res.write(`data: ${JSON.stringify({ chunk, done: false })}\n\n`);
      await new Promise((resolve) => setTimeout(resolve, 35));
    }

    // 6. Save assistant message to DB & signal completion
    await this.saveMessage(sessionId, 'assistant', museReply);
    res.write(`data: ${JSON.stringify({ chunk: '', done: true, fullResponse: museReply })}\n\n`);
    res.end();
  }
}

export const aiAssistantService = new AIAssistantService();
