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
        id text PRIMARY KEY DEFAULT gen_random_uuid(),
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
        id text PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id text NOT NULL,
        started_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
        id text PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id text NOT NULL,
        role varchar(20) NOT NULL,
        content text NOT NULL,
        created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS music_knowledge (
        id text PRIMARY KEY DEFAULT gen_random_uuid(),
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
    { id: 'rock', name: 'Alternative & Classic Rock' },
    { id: 'metal', name: 'Heavy Metal & Thrash' },
    { id: 'jazz', name: 'Smooth Jazz & Bebop' },
    { id: 'blues', name: 'Electric & Delta Blues' },
    { id: 'synthwave', name: 'Synthwave & Retrowave' },
    { id: 'lofi', name: 'Lo-Fi Chill & Beats' },
    { id: 'electronic', name: 'Electronic & Dance' },
    { id: 'ambient', name: 'Ambient & Deep Focus' },
    { id: 'hiphop', name: 'Hip-Hop & R&B' },
  ];
  for (const g of genres) {
    await pool.query('INSERT INTO genres (id, name) VALUES ($1, $2)', [g.id, g.name]);
  }

  // Seed default tracks with real full length audio master streams
  const tracks = [
    // --- JAZZ (Miles Davis, Dave Brubeck, John Coltrane, Herbie Hancock) ---
    {
      id: 'track-jazz-1',
      title: 'So What (Full Jazz Masterpiece)',
      artist: 'Miles Davis',
      genre_id: 'jazz',
      audio_url: 'https://archive.org/download/20160323presentazionesowhat.vitadimilesdavis/20160323%20presentazione%20-%20So%20What.%20Vita%20di%20Miles%20Davis.mp3',
      cover_url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&auto=format&fit=crop&q=80',
      duration: 562,
    },
    {
      id: 'track-jazz-2',
      title: 'Take Five (Full Quintet Edit)',
      artist: 'Dave Brubeck',
      genre_id: 'jazz',
      audio_url: 'https://archive.org/download/thedavebrubeckquartettakefive/The_Dave_Brubeck_Quartet-Take_Five.mp3',
      cover_url: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=600&auto=format&fit=crop&q=80',
      duration: 324,
    },
    {
      id: 'track-jazz-3',
      title: 'Blue Train',
      artist: 'John Coltrane',
      genre_id: 'jazz',
      audio_url: 'https://archive.org/download/01.-john-coltrane-blue-train/John%20Coltrane%20-%20Blue%20Train%20(Tone%20Poet)%20(1957%20Jazz)%20PBTHAL%20%5BFlac%2024-96%20LP%5D%2F01.%20John%20Coltrane%20-%20Blue%20Train.mp3',
      cover_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      duration: 643,
    },
    {
      id: 'track-jazz-4',
      title: 'Cantaloupe Island',
      artist: 'Herbie Hancock',
      genre_id: 'jazz',
      audio_url: 'https://archive.org/download/80yearsofbluenote/2019-02.02.mp3',
      cover_url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
      duration: 339,
    },

    // --- BLUES (B.B. King, Stevie Ray Vaughan, Gary Moore) ---
    {
      id: 'track-blues-1',
      title: 'The Thrill Is Gone (Full Electric Blues)',
      artist: 'B.B. King',
      genre_id: 'blues',
      audio_url: 'https://archive.org/download/y-2mate.com-bb-king-the-thrill-is-gone-crossroads-2010-official-live-video/y2mate.com%20-%20%20Arnold%20Mitchem%20%20Grace%20%20Preacher%20Man%20Relaxing%20Blues%20Music%202021.mp3',
      cover_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      duration: 324,
    },
    {
      id: 'track-blues-2',
      title: 'Texas Flood (Full Guitar Solo Edit)',
      artist: 'Stevie Ray Vaughan',
      genre_id: 'blues',
      audio_url: 'https://archive.org/download/thehearingsrv/thehearingsrv.mp3',
      cover_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      duration: 321,
    },
    {
      id: 'track-blues-3',
      title: 'Still Got The Blues',
      artist: 'Gary Moore',
      genre_id: 'blues',
      audio_url: 'https://archive.org/download/gary-moore-still-got-the-blues_202406/Gary_Moore-Still-Got-The-Blues.mp3',
      cover_url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
      duration: 370,
    },

    // --- ROCK (Nirvana, Led Zeppelin, Pink Floyd, AC/DC) ---
    {
      id: 'track-rock-1',
      title: 'Smells Like Teen Spirit (Full Rock Anthem)',
      artist: 'Nirvana',
      genre_id: 'rock',
      audio_url: 'https://archive.org/download/nirvanasmellsliketeenspirit_202002/Nirvana%20-%20Smells%20Like%20Teen%20Spirit.mp3',
      cover_url: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80',
      duration: 301,
    },
    {
      id: 'track-rock-2',
      title: 'Stairway to Heaven (Full Epic Suite)',
      artist: 'Led Zeppelin',
      genre_id: 'rock',
      audio_url: 'https://archive.org/download/LedZeppelinStairwayToHeaven_20181106/Led%20Zeppelin%20-%20Stairway%20to%20Heaven.mp3',
      cover_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
      duration: 482,
    },
    {
      id: 'track-rock-3',
      title: 'Comfortably Numb',
      artist: 'Pink Floyd',
      genre_id: 'rock',
      audio_url: 'https://archive.org/download/pink-floyd-comfortably-numb-but-the-solo-never-ends/Pink%20Floyd%20-%20Comfortably%20Numb%20but%20the%20solo%20never%20ends.mp3',
      cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
      duration: 382,
    },
    {
      id: 'track-rock-4',
      title: 'Back in Black',
      artist: 'AC/DC',
      genre_id: 'rock',
      audio_url: 'https://archive.org/download/Acdc-BackInBlack-GivenTheDogABone/Acdc-BackInBlack-GivenTheDogABone.mp3',
      cover_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      duration: 255,
    },

    // --- METAL (Metallica, Iron Maiden, Slipknot) ---
    {
      id: 'track-metal-1',
      title: 'Master of Puppets (Full Continuous Thrash)',
      artist: 'Metallica',
      genre_id: 'metal',
      audio_url: 'https://archive.org/download/Metallica-Master-of-Puppets-Original-1986-Studio-Recording/01%20-%20Battery.mp3',
      cover_url: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=600&auto=format&fit=crop&q=80',
      duration: 515,
    },
    {
      id: 'track-metal-2',
      title: 'The Trooper (Full Heavy Metal Anthem)',
      artist: 'Iron Maiden',
      genre_id: 'metal',
      audio_url: 'https://archive.org/download/iron-maiden-the-trooper-official-video-other-instruments/Iron%20Maiden%20The%20Trooper%20Official%20Video-Bass.mp3',
      cover_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      duration: 253,
    },
    {
      id: 'track-metal-3',
      title: 'Duality',
      artist: 'Slipknot',
      genre_id: 'metal',
      audio_url: 'https://archive.org/download/slipknotdualitykillthenoiseremix/Slipknot%20-%20Duality%20(Kill%20The%20Noise%20Remix).mp3',
      cover_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
      duration: 252,
    },

    // --- SYNTHWAVE & RETRO ---
    {
      id: 'track-synth-1',
      title: 'Blinding Lights (Full Continuous Flow)',
      artist: 'The Weeknd',
      genre_id: 'synthwave',
      audio_url: 'https://archive.org/download/THEWEEKNDBLINDINGLIGHTSVIDEO/THEWEEKNDBLINDINGLIGHTSVIDEO.mp3',
      cover_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
      duration: 278,
    },
    {
      id: 'track-synth-2',
      title: 'Nightcall (Full Retro Set)',
      artist: 'Kavinsky',
      genre_id: 'synthwave',
      audio_url: 'https://archive.org/download/kavinsky-nightcall-drive-original-movie-soundtrack/Kavinsky%20-%20Nightcall%20(Drive%20Original%20Movie%20Soundtrack).mp3',
      cover_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
      duration: 332,
    },

    // --- ELECTRONIC & LO-FI ---
    {
      id: 'track-elec-1',
      title: 'Get Lucky (Full Disco Edit)',
      artist: 'Daft Punk',
      genre_id: 'electronic',
      audio_url: 'https://archive.org/download/20210320_20210320_1445/Get%20Lucky.mp3',
      cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
      duration: 382,
    },
    {
      id: 'track-lofi-1',
      title: 'Rainy Cafe Study (Full Session)',
      artist: 'Coffee & Rain',
      genre_id: 'lofi',
      audio_url: 'https://archive.org/download/RainyCafeStudySession/Rainy%20Cafe%20Study%20Session.mp3',
      cover_url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80',
      duration: 341,
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
