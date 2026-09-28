import crypto from 'crypto';
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

    const sessionId = crypto.randomUUID();
    const created = await pool.query<ChatSessionRecord>(
      'INSERT INTO chat_sessions (id, user_id) VALUES ($1, $2) RETURNING id, user_id, started_at',
      [sessionId, userId]
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
    const messageId = crypto.randomUUID();
    const res = await pool.query<ChatMessageRecord>(
      'INSERT INTO chat_messages (id, session_id, role, content) VALUES ($1, $2, $3, $4) RETURNING id, session_id, role, content, created_at',
      [messageId, sessionId, role, content]
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

  private async generateRealAIReply(
    userMessage: string,
    chatHistory: ChatMessageRecord[],
    ragContext: string
  ): Promise<string | null> {
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    const systemPrompt = `You are DJ Muse, the hyper-intelligent, stylish, neural AI music curator and companion in the Anaska music streaming application.
You speak with a cool, modern, evocative tone (cyberpunk aesthetic, crisp, friendly, engaging, audio-savvy).
You discuss music genres (synthwave, lo-fi, ambient cryo, techno, electronic, jazz, etc.), sound textures, frequencies, moods, BPM, and artists.
You can recommend music, explain musical composition, or vibe with the listener.
Keep responses concise, conversational, and punchy (1 to 3 short paragraphs max unless asked for a deep dive).

${ragContext ? `Catalog knowledge & track context from Anaska library:\n${ragContext}` : ''}`;

    // 1. Try Gemini if configured
    if (geminiKey) {
      try {
        const contents: any[] = [];
        const recent = chatHistory.slice(-6);
        for (const m of recent) {
          contents.push({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          });
        }
        contents.push({
          role: 'user',
          parts: [{ text: userMessage }],
        });

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemPrompt }],
            },
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 600,
            },
          }),
        });

        if (response.ok) {
          const data: any = await response.json();
          const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) return candidateText;
        } else {
          console.warn('[DJ Muse] Gemini API error status:', response.status);
        }
      } catch (err) {
        console.warn('[DJ Muse] Gemini call failed, falling back:', err);
      }
    }

    // 2. Try OpenAI if configured
    if (openaiKey) {
      try {
        const messages: any[] = [{ role: 'system', content: systemPrompt }];
        const recent = chatHistory.slice(-6);
        for (const m of recent) {
          messages.push({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          });
        }
        messages.push({ role: 'user', content: userMessage });

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages,
            temperature: 0.7,
            max_tokens: 600,
          }),
        });

        if (response.ok) {
          const data: any = await response.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply) return reply;
        } else {
          console.warn('[DJ Muse] OpenAI API error status:', response.status);
        }
      } catch (err) {
        console.warn('[DJ Muse] OpenAI call failed, falling back:', err);
      }
    }

    // 3. Try Groq if configured
    if (groqKey) {
      try {
        const messages: any[] = [{ role: 'system', content: systemPrompt }];
        const recent = chatHistory.slice(-6);
        for (const m of recent) {
          messages.push({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          });
        }
        messages.push({ role: 'user', content: userMessage });

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages,
            temperature: 0.7,
            max_tokens: 600,
          }),
        });

        if (response.ok) {
          const data: any = await response.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply) return reply;
        } else {
          console.warn('[DJ Muse] Groq API error status:', response.status);
        }
      } catch (err) {
        console.warn('[DJ Muse] Groq call failed, falling back:', err);
      }
    }

    // 4. Default zero-config Real AI (Free high-performance GPT-4 endpoint)
    try {
      const messages: any[] = [{ role: 'system', content: systemPrompt }];
      const recent = chatHistory.slice(-6);
      for (const m of recent) {
        messages.push({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        });
      }
      messages.push({ role: 'user', content: userMessage });

      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          model: 'openai',
          seed: Math.floor(Math.random() * 10000),
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (response.ok) {
        const text = await response.text();
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      }
    } catch (err) {
      console.warn('[DJ Muse] Free AI provider call failed, falling back to heuristics:', err);
    }

    return null;
  }

  async streamResponse(
    sessionId: string,
    userMessage: string,
    res: Response
  ): Promise<void> {
    // 1. Fetch previous session history
    const history = await this.getSessionMessages(sessionId);

    // 2. Save user message to database
    await this.saveMessage(sessionId, 'user', userMessage);

    // 3. Fetch context via RAG
    const ragContext = await this.getContext(userMessage);

    // 4. Set SSE HTTP headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    res.write(': ping\n\n');

    // 5. Generate intelligent DJ Muse response (Real LLM or curated fallback)
    let museReply: string | null = null;
    try {
      museReply = await this.generateRealAIReply(userMessage, history, ragContext);
    } catch (e) {
      console.warn('[DJ Muse] AI reply generation error:', e);
    }

    if (!museReply) {
      const q = userMessage.toLowerCase();
      if (q.includes('recommend') || q.includes('suggest') || q.includes('track') || q.includes('song')) {
        museReply = `Hey there! 🎧 DJ Muse here with your sonic prescription. Based on our catalog, check out:\n\n${ragContext || '• "Neon Horizon" by Cyberpulse (Synthwave)\n• "Rainy Cafe Study" by Coffee & Rain (Lo-Fi Chill)'
          }\n\nSink into the groove and let me know how that resonates!`;
      } else if (q.includes('lofi') || q.includes('chill') || q.includes('study')) {
        museReply = `Ah, craving that cozy warmth! ☕ Lo-fi hip hop combines tape-hiss warmth with jazzy chords designed for focus and calm. I suggest throwing on "Rainy Cafe Study" or "Golden Hour Dreams".`;
      } else if (q.includes('synthwave') || q.includes('retro') || q.includes('80s')) {
        museReply = `Turn the headlights on! 🏎️💨 Synthwave draws from 80s arcade nostalgia and lush analog synthesizers. Check out "Neon Horizon" by Cyberpulse or "Midnight Drive" by Vector Runner!`;
      } else if (q.includes('who are you') || q.includes('dj muse')) {
        museReply = `I am DJ Muse, your personal AI music curator in Anaska! 🎵 I can provide track recommendations, dive into music trivia, or match playlists to your current mood. What vibe are you after today?`;
      } else {
        museReply = `That's an interesting musical thought! ${ragContext ? `Here's a cool nugget from our archives:\n${ragContext}\n\n` : ''
          }I'm here to match you with sounds that elevate your flow. Want some synthwave rhythms or chill lo-fi beats?`;
      }
    }

    // 6. Stream words/tokens via SSE with realistic chunking
    const chunks = museReply.match(/\S+\s*/g) || [museReply];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      res.write(`data: ${JSON.stringify({ chunk, done: false })}\n\n`);
      await new Promise((resolve) => setTimeout(resolve, 25));
    }

    // 7. Save assistant message to DB & signal completion
    await this.saveMessage(sessionId, 'assistant', museReply);
    res.write(`data: ${JSON.stringify({ chunk: '', done: true, fullResponse: museReply })}\n\n`);
    res.end();
  }
}

export const aiAssistantService = new AIAssistantService();
