import bcrypt from 'bcrypt';
import { realPgPool } from './index';

export async function seedDatabase() {
  console.log('🌱 Checking PostgreSQL connection for seeding...');

  try {
    const client = await realPgPool.connect();

    try {
      // 1. Seed Genres
      const genres = [
        { id: 'synthwave', name: 'Synthwave & Retrowave' },
        { id: 'lofi', name: 'Lo-Fi Chill & Beats' },
        { id: 'electronic', name: 'Electronic & Dance' },
        { id: 'ambient', name: 'Ambient & Deep Focus' },
        { id: 'rock', name: 'Alternative & Indie Rock' },
        { id: 'metal', name: 'Heavy Metal & Industrial' },
        { id: 'hiphop', name: 'Hip-Hop & R&B' },
      ];

      for (const g of genres) {
        await client.query(
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
          audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          cover_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
          duration: 372,
        },
        {
          id: 'track-2',
          title: 'Midnight Drive',
          artist: 'Vector Runner',
          genre_id: 'synthwave',
          audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
          cover_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
          duration: 423,
        },
        {
          id: 'track-3',
          title: 'Rainy Cafe Study',
          artist: 'Coffee & Rain',
          genre_id: 'lofi',
          audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
          cover_url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80',
          duration: 341,
        },
        {
          id: 'track-4',
          title: 'Golden Hour Dreams',
          artist: 'Pastel Sunset',
          genre_id: 'lofi',
          audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
          cover_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
          duration: 288,
        },
        {
          id: 'track-5',
          title: 'Digital Aurora',
          artist: 'Quantum Pulse',
          genre_id: 'electronic',
          audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
          cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
          duration: 382,
        },
        {
          id: 'track-6',
          title: 'Deep Starlight',
          artist: 'Celestial Echo',
          genre_id: 'ambient',
          audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
          cover_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
          duration: 312,
        },
        {
          id: 'track-7',
          title: 'Echoes of Velocity',
          artist: 'The Velvet Strangers',
          genre_id: 'rock',
          audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
          cover_url: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80',
          duration: 258,
        },
        {
          id: 'track-rock-2',
          title: 'Rebel Ignition',
          artist: 'Iron Circuit',
          genre_id: 'rock',
          audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
          cover_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
          duration: 310,
        },
        {
          id: 'track-rock-3',
          title: 'Midnight Overdrive',
          artist: 'Electric Phantom',
          genre_id: 'rock',
          audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
          cover_url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
          duration: 285,
        },
        {
          id: 'track-metal-1',
          title: 'Cyberpunk Industrial Metal',
          artist: 'Distorted Orion',
          genre_id: 'metal',
          audio_url: 'https://discoveryprovider.audius.co/v1/tracks/GEB4kJw/stream?app_name=ANASKA',
          cover_url: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=600&auto=format&fit=crop&q=80',
          duration: 245,
        },
        {
          id: 'track-metal-2',
          title: 'Monolith Peak',
          artist: 'Distorted Orion',
          genre_id: 'metal',
          audio_url: 'https://discoveryprovider.audius.co/v1/tracks/N6E3ao8/stream?app_name=ANASKA',
          cover_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
          duration: 263,
        },
        {
          id: 'track-metal-3',
          title: 'Titanium Wrath',
          artist: 'Black Ice Protocol',
          genre_id: 'metal',
          audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
          cover_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
          duration: 340,
        },
        {
          id: 'track-metal-4',
          title: 'Abyssal Surge',
          artist: 'Valkyrie Down',
          genre_id: 'metal',
          audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
          cover_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
          duration: 298,
        },
        {
          id: 'track-8',
          title: 'Metropolis Flow',
          artist: 'Southside Beats',
          genre_id: 'hiphop',
          audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
          cover_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&auto=format&fit=crop&q=80',
          duration: 295,
        },
        {
          id: 'track-9',
          title: 'Escape It',
          artist: 'IXAM',
          genre_id: 'electronic',
          audio_url: 'https://discoveryprovider.audius.co/v1/tracks/yN6OWP7/stream?app_name=ANASKA',
          cover_url: 'https://v.monophonic.digital/content/baeaaaiqseaxy73um6woz2thqq7wftgcinpa2fxksugz36oqbmvuw6pnmemxk4/480x480.jpg',
          duration: 220,
        },
      ];

      for (const t of tracks) {
        await client.query(
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
      await client.query(
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
        await client.query(
          `INSERT INTO music_knowledge (title, artist, genre, content)
           VALUES ($1, $2, $3, $4)`,
          [k.title, k.artist, k.genre, k.content]
        );
      }
      console.log(`✓ Seeded ${knowledge.length} music knowledge entries for DJ Muse.`);
    } finally {
      client.release();
    }
  } catch (err: any) {
    if (err.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED')) {
      console.log('ℹ️  PostgreSQL not running on port 5432. All seed data is already bundled');
      console.log('    and pre-loaded into the in-memory fallback! You can start right away.');
      return;
    }
    console.error('Seed error:', err);
    throw err;
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => realPgPool.end())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
