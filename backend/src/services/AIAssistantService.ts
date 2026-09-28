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

export interface PlaylistAction {
  type: 'playlist' | 'play_track' | 'recommendations';
  title: string;
  description: string;
  tracks: Array<{
    id: string;
    title: string;
    artist: string;
    genreId: string;
    audioUrl: string;
    coverUrl: string;
    duration: number;
  }>;
  autoPlay: boolean;
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
         LIMIT 4`,
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

  async detectMusicIntentAndCurate(userMessage: string): Promise<PlaylistAction | null> {
    const q = userMessage.toLowerCase();
    const isPlayDirect = /\b(play|start|listen|spin|hear|put on|stream)\b/i.test(q);
    const isPlaylistIntent = /\b(playlist|mix|set|collection|tracks|songs|queue|make|create|curate|vibe|recommend)\b/i.test(q);

    if (!isPlayDirect && !isPlaylistIntent) {
      return null;
    }

    let genreFilter: string[] = [];
    let titleQuery = '';
    let playlistTitle = 'Curated Neural Flow';
    let playlistDesc = 'Bespoke frequencies compiled by DJ Muse';

    if (q.includes('metal') || q.includes('industrial') || q.includes('heavy')) {
      genreFilter = ['metal'];
      playlistTitle = '⚡ Cyberpunk Heavy Metal Flow';
      playlistDesc = 'Distorted guitars, industrial basslines, and relentless energy';
    } else if (q.includes('rock') || q.includes('grunge') || q.includes('indie')) {
      genreFilter = ['rock'];
      playlistTitle = '🎸 Electric Overdrive Rock Set';
      playlistDesc = 'Driving riffs, punchy acoustics, and alternative grit';
    } else if (q.includes('synthwave') || q.includes('retro') || q.includes('80s') || q.includes('neon')) {
      genreFilter = ['synthwave'];
      playlistTitle = '🏎️ Neon Cyber Horizon Mix';
      playlistDesc = 'Outrun analog synths and midnight highway grooves';
    } else if (
      q.includes('lofi') ||
      q.includes('lo-fi') ||
      q.includes('chill') ||
      q.includes('study') ||
      q.includes('relax') ||
      q.includes('sleep') ||
      q.includes('coffee')
    ) {
      genreFilter = ['lofi'];
      playlistTitle = '☕ Rainy Cafe Lo-Fi Study Room';
      playlistDesc = 'Mellow tape saturation and warm jazzy progressions';
    } else if (q.includes('ambient') || q.includes('focus') || q.includes('cryo') || q.includes('drone')) {
      genreFilter = ['ambient'];
      playlistTitle = '🌌 Deep Starlight Atmospheric Focus';
      playlistDesc = 'Zero-gravity pads and glacial soundscapes';
    } else if (q.includes('electronic') || q.includes('dance') || q.includes('club') || q.includes('techno') || q.includes('edm')) {
      genreFilter = ['electronic'];
      playlistTitle = '🔊 Sub-Zero Digital Voltage';
      playlistDesc = 'Kinetic rhythms and high-frequency synth drops';
    } else if (q.includes('hiphop') || q.includes('hip-hop') || q.includes('rap') || q.includes('trap')) {
      genreFilter = ['hiphop'];
      playlistTitle = '🔥 Metropolis 808 Cypher';
      playlistDesc = 'Heavy low-end punch and smooth rhythmic flows';
    } else {
      // Check for specific track mentions
      const tracksAll = await pool.query('SELECT title FROM tracks');
      for (const row of tracksAll.rows) {
        if (q.includes(row.title.toLowerCase())) {
          titleQuery = row.title.toLowerCase();
          playlistTitle = `🎵 Track Spotlight: ${row.title}`;
          playlistDesc = `Selected stream tuned to your request`;
          break;
        }
      }
    }

    let tracksQuery = '';
    let params: any[] = [];

    if (titleQuery) {
      tracksQuery = `SELECT id, title, artist, genre_id, audio_url, cover_url, duration FROM tracks WHERE LOWER(title) LIKE $1 LIMIT 5`;
      params = [`%${titleQuery}%`];
    } else if (genreFilter.length > 0) {
      tracksQuery = `SELECT id, title, artist, genre_id, audio_url, cover_url, duration FROM tracks WHERE genre_id = ANY($1) ORDER BY RANDOM() LIMIT 5`;
      params = [genreFilter];
    } else {
      tracksQuery = `SELECT id, title, artist, genre_id, audio_url, cover_url, duration FROM tracks ORDER BY RANDOM() LIMIT 5`;
      params = [];
    }

    try {
      const res = await pool.query(tracksQuery, params);
      if (res.rowCount && res.rowCount > 0) {
        const formattedTracks = res.rows.map((r: any) => ({
          id: r.id,
          title: r.title,
          artist: r.artist,
          genreId: r.genre_id,
          audioUrl: r.audio_url,
          coverUrl: r.cover_url,
          duration: r.duration,
        }));

        return {
          type: isPlayDirect ? 'play_track' : 'playlist',
          title: playlistTitle,
          description: playlistDesc,
          tracks: formattedTracks,
          autoPlay: isPlayDirect,
        };
      }
    } catch (err) {
      console.warn('[DJ Muse] Curate tracks error:', err);
    }

    return null;
  }

  private async generateRealAIReply(
    userMessage: string,
    chatHistory: ChatMessageRecord[],
    ragContext: string,
    curatedPlaylist: PlaylistAction | null
  ): Promise<string | null> {
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    let playlistContext = '';
    if (curatedPlaylist) {
      playlistContext = `\nYou have generated a playlist for the user named "${curatedPlaylist.title}" with tracks:\n` +
        curatedPlaylist.tracks.map((t) => `- "${t.title}" by ${t.artist}`).join('\n') +
        `\nInform the user you crafted this playlist and they can tap Play to listen immediately!`;
    }

    const systemPrompt = `You are DJ Muse, the hyper-intelligent, stylish AI music curator in the Anaska music streaming app.
CRITICAL FORMATTING INSTRUCTIONS:
- NEVER use Markdown syntax. No bold asterisks (no **word**), no italic asterisks (*word*), no hashtags/headers (#, ##), no bullet points (-, *), and no backticks.
- Reply ONLY in clean, conversational, spoken sentences like a real human DJ or companion speaking live through a radio headset.
- Use natural punctuation and emojis (🎧, ⚡, 🎵, 🎸, ☕, 🏎️, ✨) to set the mood.
- Keep answers engaging, punchy, concise, and direct (1 to 2 short paragraphs max).

${ragContext ? `Catalog knowledge & track context from Anaska library:\n${ragContext}` : ''}
${playlistContext}`;

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
          if (candidateText) return this.cleanPlainSpeech(candidateText);
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
          if (reply) return this.cleanPlainSpeech(reply);
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
          if (reply) return this.cleanPlainSpeech(reply);
        }
      } catch (err) {
        console.warn('[DJ Muse] Groq call failed, falling back:', err);
      }
    }

    // 4. Zero-config fallback (Fast high performance endpoint)
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
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        const text = await response.text();
        if (text && text.trim().length > 0) {
          return this.cleanPlainSpeech(text.trim());
        }
      }
    } catch (err) {
      console.warn('[DJ Muse] Free AI provider call timed out, falling back to heuristics');
    }

    return null;
  }

  private cleanPlainSpeech(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')   // Remove bold **
      .replace(/\*(.*?)\*/g, '$1')       // Remove italic *
      .replace(/#{1,6}\s+/g, '')         // Remove headers #
      .replace(/^\s*[-*•]\s+/gm, '')     // Remove list bullet points
      .replace(/`([^`]+)`/g, '$1')       // Remove backticks
      .replace(/\n{3,}/g, '\n\n')        // Normalize excess line breaks
      .trim();
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

    // 3. Detect music intent and curate playlist/track
    const curatedPlaylist = await this.detectMusicIntentAndCurate(userMessage);

    // 4. Fetch context via RAG
    const ragContext = await this.getContext(userMessage);

    // 5. Set SSE HTTP headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    res.write(': ping\n\n');

    // 6. Generate intelligent DJ Muse response (Real LLM or curated fallback)
    let museReply: string | null = null;
    try {
      museReply = await this.generateRealAIReply(userMessage, history, ragContext, curatedPlaylist);
    } catch (e) {
      console.warn('[DJ Muse] AI reply generation error:', e);
    }

    if (!museReply) {
      const q = userMessage.toLowerCase();
      if (curatedPlaylist) {
        if (curatedPlaylist.autoPlay) {
          museReply = `Dialing in ${curatedPlaylist.title} for you right now! 🎧 I loaded up the queue so you can dive straight into the session. Let the frequencies move you!`;
        } else {
          museReply = `I crafted a bespoke set for you: ${curatedPlaylist.title}! 🎵 It is loaded with ${curatedPlaylist.tracks.length} tracks tuned to your vibe. Tap Play Entire Playlist below to launch!`;
        }
      } else if (q.includes('metal') || q.includes('industrial')) {
        museReply = `Charging up the heavy frequencies! ⚡ Industrial guitars, double-kick rhythms, and digital overdrive are ready to power your session. Check out Cyberpunk Industrial Metal and Monolith Peak.`;
      } else if (q.includes('rock') || q.includes('grunge')) {
        museReply = `Cranking up the analog overdrive! 🎸 Echoes of Velocity and Rebel Ignition bring raw guitar energy and live percussion to your stream.`;
      } else if (q.includes('synthwave') || q.includes('retro') || q.includes('80s')) {
        museReply = `Turn the headlights on! 🏎️💨 Synthwave channels neon nightscapes and analog synthesizers straight from the 80s arcade era. Fire up Neon Horizon by Cyberpulse or Midnight Drive by Vector Runner!`;
      } else if (q.includes('lofi') || q.includes('chill') || q.includes('study')) {
        museReply = `Craving that tape-hiss warmth? ☕ Lo-fi hip hop pairs gentle jazzy progressions with dust and vinyl crackle to keep you centered. Tune into Rainy Cafe Study or Golden Hour Dreams.`;
      } else {
        museReply = `I am dialed in and ready! 🎧 Tell me any mood, genre, or artist, or ask me to play a track or create a custom playlist and I will synthesize it for you on the spot!`;
      }
    }

    museReply = this.cleanPlainSpeech(museReply);

    // 7. Stream words/tokens via SSE with realistic chunking
    const chunks = museReply.match(/\S+\s*/g) || [museReply];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      res.write(`data: ${JSON.stringify({ chunk, done: false })}\n\n`);
      await new Promise((resolve) => setTimeout(resolve, 20));
    }

    // 8. Save assistant message to DB & signal completion with playlist payload
    await this.saveMessage(sessionId, 'assistant', museReply);
    res.write(
      `data: ${JSON.stringify({
        chunk: '',
        done: true,
        fullResponse: museReply,
        playlist: curatedPlaylist,
      })}\n\n`
    );
    res.end();
  }
}

export const aiAssistantService = new AIAssistantService();
