import bcrypt from 'bcrypt';
import { pool } from './index';

export async function seedDatabase() {
  console.log('🌱 Seeding database...');

  // 1. Seed Genres
  const genres = [
    { id: 'synthwave', name: 'Synthwave & Retrowave' },
    { id: 'lofi', name: 'Lo-Fi Chill & Beats' },
    { id: 'electronic', name: 'Electronic & Dance' },
    { id: 'ambient', name: 'Ambient & Deep Focus' },
    { id: 'rock', name: 'Alternative & Indie Rock' },
    { id: 'hiphop', name: 'Hip-Hop & R&B' },
  ];

  for (const g of genres) {
    await pool.query(
      `INSERT INTO genres (id, name)
       VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name`,
      [g.id, g.name]
    );
  }
  console.log(`✓ Seeded ${genres.length} genres.`);

  // 2. Seed Tracks
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
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         artist = EXCLUDED.artist,
         genre_id = EXCLUDED.genre_id,
         audio_url = EXCLUDED.audio_url,
         cover_url = EXCLUDED.cover_url,
         duration = EXCLUDED.duration`,
      [t.id, t.title, t.artist, t.genre_id, t.audio_url, t.cover_url, t.duration]
    );
  }
  console.log(`✓ Seeded ${tracks.length} tracks.`);

  // 3. Seed Demo User
  const demoPasswordHash = await bcrypt.hash('password123', 10);
  await pool.query(
    `INSERT INTO users (username, email, password_hash, genre_preferences)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (username) DO NOTHING`,
    ['musiclover', 'demo@anaska.com', demoPasswordHash, ['synthwave', 'lofi']]
  );
  console.log('✓ Seeded demo user: demo@anaska.com / password123');

  // 4. Seed Music Knowledge (for DJ Muse RAG agent)
  const knowledge = [
    {
      title: 'The Origins of Synthwave',
      artist: 'Various Artists',
      genre: 'synthwave',
      content:
        'Synthwave emerged in the mid-2000s, heavily influenced by 1980s film soundtracks, video games, and synth-pop. Key pioneers include Kavinsky, Carpenter Brut, and Gunship. It evokes neon aesthetics, retro-futuristic cars, and analog synthesizer arpeggios.',
    },
    {
      title: 'Lo-Fi Hip Hop and Chillhop Culture',
      artist: 'ChilledCow & Nujabes',
      genre: 'lofi',
      content:
        'Lo-Fi beats feature deliberate audio imperfections like vinyl crackle, tape hiss, and relaxed jazzy chord progressions inspired by Nujabes and J Dilla. It became a global soundtrack for study and relaxation.',
    },
    {
      title: 'Evolution of Electronic Dance Music',
      artist: 'Daft Punk, Kraftwerk',
      genre: 'electronic',
      content:
        'Electronic music pioneered machine beats through the Roland TR-808 and TR-909. Daft Punk fused French house with funk samples to bring club culture into global mainstream festivals.',
    },
  ];

  for (const k of knowledge) {
    await pool.query(
      `INSERT INTO music_knowledge (title, artist, genre, content)
       VALUES ($1, $2, $3, $4)`,
      [k.title, k.artist, k.genre, k.content]
    );
  }
  console.log(`✓ Seeded ${knowledge.length} music knowledge entries for DJ Muse.`);
}

if (require.main === module) {
  seedDatabase()
    .then(() => pool.end())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
