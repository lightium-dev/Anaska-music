import { newDb, IMemoryDb } from 'pg-mem';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

let memDbInstance: IMemoryDb | null = null;
let memPoolInstance: any = null;

export async function getOrCreateMemoryDb(): Promise<{ db: IMemoryDb; pool: any }> {
  if (memPoolInstance && memDbInstance) {
    return { db: memDbInstance, pool: memPoolInstance };
  }

  const db = newDb();

  // Register extensions & Postgres crypto functions
  db.registerExtension('uuid-ossp', (schema) => {
    schema.registerFunction({
      name: 'uuid_generate_v4',
      implementation: () => crypto.randomUUID(),
    });
  });

  db.registerExtension('pgcrypto', (schema) => {
    schema.registerFunction({
      name: 'gen_random_uuid',
      implementation: () => crypto.randomUUID(),
    });
  });

  db.registerExtension('vector', () => {});

  db.public.registerFunction({
    name: 'gen_random_uuid',
    implementation: () => crypto.randomUUID(),
  });

  // Schema creation
  db.public.none(`
    CREATE TABLE IF NOT EXISTS users (
        id text PRIMARY KEY,
        username varchar(50) UNIQUE NOT NULL,
        email varchar(255) UNIQUE NOT NULL,
        password_hash varchar(255) NOT NULL,
        avatar varchar(500),
        genre_preferences text[] DEFAULT '{}',
        created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS genres (
        id varchar(50) PRIMARY KEY,
        name varchar(100) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS tracks (
        id varchar(50) PRIMARY KEY,
        title varchar(255) NOT NULL,
        artist varchar(255) NOT NULL,
        genre_id varchar(50) NOT NULL,
        audio_url text NOT NULL,
        cover_url text NOT NULL,
        duration integer NOT NULL,
        created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chat_sessions (
        id text PRIMARY KEY,
        user_id text NOT NULL,
        started_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
        id text PRIMARY KEY,
        session_id text NOT NULL,
        role varchar(20) NOT NULL,
        content text NOT NULL,
        created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS music_knowledge (
        id text PRIMARY KEY,
        title varchar(255) NOT NULL,
        artist varchar(255),
        genre varchar(100),
        content text NOT NULL,
        created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const { Pool } = db.adapters.createPg();
  const pool = new Pool();

  // Seed default genres
  const genres = [
    { id: 'synthwave', name: 'Synthwave & Retrowave' },
    { id: 'lofi', name: 'Lo-Fi Chill & Beats' },
    { id: 'electronic', name: 'Electronic & Dance' },
    { id: 'ambient', name: 'Ambient & Deep Focus' },
    { id: 'rock', name: 'Alternative & Indie Rock' },
    { id: 'hiphop', name: 'Hip-Hop & R&B' },
  ];
  for (const g of genres) {
    await pool.query('INSERT INTO genres (id, name) VALUES ($1, $2)', [g.id, g.name]);
  }

  // Seed default tracks
  const tracks = [
    {
      id: 'track-1',
      title: 'Neon Horizon',
      artist: 'Cyberpulse',
      genre_id: 'synthwave',
      audio_url: 'https://cdn.freesound.org/previews/612/612627_5674468-lq.mp3',
      cover_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
      duration: 195,
    },
    {
      id: 'track-2',
      title: 'Midnight Drive',
      artist: 'Vector Runner',
      genre_id: 'synthwave',
      audio_url: 'https://cdn.freesound.org/previews/682/682633_11861866-lq.mp3',
      cover_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
      duration: 210,
    },
    {
      id: 'track-3',
      title: 'Rainy Cafe Study',
      artist: 'Coffee & Rain',
      genre_id: 'lofi',
      audio_url: 'https://cdn.freesound.org/previews/531/531947_11861866-lq.mp3',
      cover_url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80',
      duration: 154,
    },
    {
      id: 'track-4',
      title: 'Golden Hour Dreams',
      artist: 'Pastel Sunset',
      genre_id: 'lofi',
      audio_url: 'https://cdn.freesound.org/previews/675/675841_11861866-lq.mp3',
      cover_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      duration: 178,
    },
    {
      id: 'track-5',
      title: 'Digital Aurora',
      artist: 'Quantum Pulse',
      genre_id: 'electronic',
      audio_url: 'https://cdn.freesound.org/previews/557/557811_11861866-lq.mp3',
      cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
      duration: 242,
    },
    {
      id: 'track-6',
      title: 'Deep Starlight',
      artist: 'Celestial Echo',
      genre_id: 'ambient',
      audio_url: 'https://cdn.freesound.org/previews/512/512471_11861866-lq.mp3',
      cover_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      duration: 310,
    },
    {
      id: 'track-7',
      title: 'Echoes of Velocity',
      artist: 'The Velvet Strangers',
      genre_id: 'rock',
      audio_url: 'https://cdn.freesound.org/previews/415/415511_11861866-lq.mp3',
      cover_url: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80',
      duration: 188,
    },
    {
      id: 'track-8',
      title: 'Metropolis Flow',
      artist: 'Southside Beats',
      genre_id: 'hiphop',
      audio_url: 'https://cdn.freesound.org/previews/476/476672_11861866-lq.mp3',
      cover_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&auto=format&fit=crop&q=80',
      duration: 165,
    },
  ];

  for (const t of tracks) {
    await pool.query(
      `INSERT INTO tracks (id, title, artist, genre_id, audio_url, cover_url, duration)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [t.id, t.title, t.artist, t.genre_id, t.audio_url, t.cover_url, t.duration]
    );
  }

  // Seed demo user
  const demoPasswordHash = await bcrypt.hash('password123', 10);
  const demoUserId = crypto.randomUUID();
  await pool.query(
    `INSERT INTO users (id, username, email, password_hash, genre_preferences)
     VALUES ($1, $2, $3, $4, $5)`,
    [demoUserId, 'musiclover', 'demo@anaska.com', demoPasswordHash, ['synthwave', 'lofi']]
  );

  // Seed music knowledge for DJ Muse
  const knowledge = [
    {
      id: crypto.randomUUID(),
      title: 'The Origins of Synthwave',
      artist: 'Various Artists',
      genre: 'synthwave',
      content:
        'Synthwave emerged in the mid-2000s, heavily influenced by 1980s film soundtracks, video games, and synth-pop. Key pioneers include Kavinsky, Carpenter Brut, and Gunship.',
    },
    {
      id: crypto.randomUUID(),
      title: 'Lo-Fi Hip Hop and Chillhop Culture',
      artist: 'ChilledCow & Nujabes',
      genre: 'lofi',
      content:
        'Lo-Fi beats feature deliberate audio imperfections like vinyl crackle, tape hiss, and relaxed jazzy chord progressions inspired by Nujabes and J Dilla.',
    },
  ];

  for (const k of knowledge) {
    await pool.query(
      `INSERT INTO music_knowledge (id, title, artist, genre, content)
       VALUES ($1, $2, $3, $4, $5)`,
      [k.id, k.title, k.artist, k.genre, k.content]
    );
  }

  memDbInstance = db;
  memPoolInstance = pool;

  return { db, pool };
}
