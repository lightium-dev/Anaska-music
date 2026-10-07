import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { getModels, initializeDatabase } from './index';

export async function seedDatabase() {
  console.log('🌱 Seeding database through Sequelize...');
  await initializeDatabase();
  const { Genre, Track, User } = await getModels();

  // 1. Seed Genres
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
    await Genre.upsert(g);
  }
  console.log(`✓ Seeded ${genres.length} genres.`);

  // 2. Seed Full-Length Tracks (3 to 6+ minutes each)
  const tracks = [
    // --- JAZZ (Miles Davis, Dave Brubeck, John Coltrane, Herbie Hancock) ---
    {
      id: 'track-jazz-1',
      title: 'So What (Full Jazz Masterpiece)',
      artist: 'Miles Davis',
      genre_id: 'jazz',
      audio_url:
        'https://archive.org/download/20160323presentazionesowhat.vitadimilesdavis/20160323%20presentazione%20-%20So%20What.%20Vita%20di%20Miles%20Davis.mp3',
      cover_url:
        'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&auto=format&fit=crop&q=80',
      duration: 562,
    },
    {
      id: 'track-jazz-2',
      title: 'Take Five (Full Quintet Edit)',
      artist: 'Dave Brubeck',
      genre_id: 'jazz',
      audio_url:
        'https://archive.org/download/thedavebrubeckquartettakefive/The_Dave_Brubeck_Quartet-Take_Five.mp3',
      cover_url:
        'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=600&auto=format&fit=crop&q=80',
      duration: 324,
    },
    {
      id: 'track-jazz-3',
      title: 'Blue Train',
      artist: 'John Coltrane',
      genre_id: 'jazz',
      audio_url:
        'https://archive.org/download/01.-john-coltrane-blue-train/John%20Coltrane%20-%20Blue%20Train%20(Tone%20Poet)%20(1957%20Jazz)%20PBTHAL%20%5BFlac%2024-96%20LP%5D%2F01.%20John%20Coltrane%20-%20Blue%20Train.mp3',
      cover_url:
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      duration: 643,
    },
    {
      id: 'track-jazz-4',
      title: 'Cantaloupe Island',
      artist: 'Herbie Hancock',
      genre_id: 'jazz',
      audio_url: 'https://archive.org/download/80yearsofbluenote/2019-02.02.mp3',
      cover_url:
        'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
      duration: 339,
    },

    // --- BLUES (B.B. King, Stevie Ray Vaughan, Gary Moore) ---
    {
      id: 'track-blues-1',
      title: 'The Thrill Is Gone (Full Electric Blues)',
      artist: 'B.B. King',
      genre_id: 'blues',
      audio_url:
        'https://archive.org/download/y-2mate.com-bb-king-the-thrill-is-gone-crossroads-2010-official-live-video/y2mate.com%20-%20%20Arnold%20Mitchem%20%20Grace%20%20Preacher%20Man%20Relaxing%20Blues%20Music%202021.mp3',
      cover_url:
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      duration: 324,
    },
    {
      id: 'track-blues-2',
      title: 'Texas Flood (Full Guitar Solo Edit)',
      artist: 'Stevie Ray Vaughan',
      genre_id: 'blues',
      audio_url: 'https://archive.org/download/thehearingsrv/thehearingsrv.mp3',
      cover_url:
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      duration: 321,
    },
    {
      id: 'track-blues-3',
      title: 'Still Got The Blues',
      artist: 'Gary Moore',
      genre_id: 'blues',
      audio_url:
        'https://archive.org/download/gary-moore-still-got-the-blues_202406/Gary_Moore-Still-Got-The-Blues.mp3',
      cover_url:
        'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
      duration: 370,
    },

    // --- ROCK (Nirvana, Led Zeppelin, Pink Floyd, AC/DC) ---
    {
      id: 'track-rock-1',
      title: 'Smells Like Teen Spirit (Full Rock Anthem)',
      artist: 'Nirvana',
      genre_id: 'rock',
      audio_url:
        'https://archive.org/download/nirvanasmellsliketeenspirit_202002/Nirvana%20-%20Smells%20Like%20Teen%20Spirit.mp3',
      cover_url:
        'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80',
      duration: 301,
    },
    {
      id: 'track-rock-2',
      title: 'Stairway to Heaven (Full Epic Suite)',
      artist: 'Led Zeppelin',
      genre_id: 'rock',
      audio_url:
        'https://archive.org/download/LedZeppelinStairwayToHeaven_20181106/Led%20Zeppelin%20-%20Stairway%20to%20Heaven.mp3',
      cover_url:
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
      duration: 482,
    },
    {
      id: 'track-rock-3',
      title: 'Comfortably Numb',
      artist: 'Pink Floyd',
      genre_id: 'rock',
      audio_url:
        'https://archive.org/download/pink-floyd-comfortably-numb-but-the-solo-never-ends/Pink%20Floyd%20-%20Comfortably%20Numb%20but%20the%20solo%20never%20ends.mp3',
      cover_url:
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
      duration: 382,
    },
    {
      id: 'track-rock-4',
      title: 'Back in Black',
      artist: 'AC/DC',
      genre_id: 'rock',
      audio_url:
        'https://archive.org/download/Acdc-BackInBlack-GivenTheDogABone/Acdc-BackInBlack-GivenTheDogABone.mp3',
      cover_url:
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      duration: 255,
    },

    // --- METAL (Metallica, Iron Maiden, Slipknot) ---
    {
      id: 'track-metal-1',
      title: 'Master of Puppets (Full Continuous Thrash)',
      artist: 'Metallica',
      genre_id: 'metal',
      audio_url:
        'https://archive.org/download/Metallica-Master-of-Puppets-Original-1986-Studio-Recording/01%20-%20Battery.mp3',
      cover_url:
        'https://images.unsplash.com/photo-1574169208507-84376144848b?w=600&auto=format&fit=crop&q=80',
      duration: 515,
    },
    {
      id: 'track-metal-2',
      title: 'The Trooper (Full Heavy Metal Anthem)',
      artist: 'Iron Maiden',
      genre_id: 'metal',
      audio_url:
        'https://archive.org/download/iron-maiden-the-trooper-official-video-other-instruments/Iron%20Maiden%20The%20Trooper%20Official%20Video-Bass.mp3',
      cover_url:
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      duration: 253,
    },
    {
      id: 'track-metal-3',
      title: 'Duality',
      artist: 'Slipknot',
      genre_id: 'metal',
      audio_url:
        'https://archive.org/download/slipknotdualitykillthenoiseremix/Slipknot%20-%20Duality%20(Kill%20The%20Noise%20Remix).mp3',
      cover_url:
        'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
      duration: 252,
    },

    // --- SYNTHWAVE & RETRO ---
    {
      id: 'track-synth-1',
      title: 'Blinding Lights (Full Continuous Flow)',
      artist: 'The Weeknd',
      genre_id: 'synthwave',
      audio_url:
        'https://archive.org/download/THEWEEKNDBLINDINGLIGHTSVIDEO/THEWEEKNDBLINDINGLIGHTSVIDEO.mp3',
      cover_url:
        'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
      duration: 278,
    },
    {
      id: 'track-synth-2',
      title: 'Nightcall (Full Retro Set)',
      artist: 'Kavinsky',
      genre_id: 'synthwave',
      audio_url:
        'https://archive.org/download/kavinsky-nightcall-drive-original-movie-soundtrack/Kavinsky%20-%20Nightcall%20(Drive%20Original%20Movie%20Soundtrack).mp3',
      cover_url:
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
      duration: 332,
    },

    // --- ELECTRONIC & LO-FI ---
    {
      id: 'track-elec-1',
      title: 'Get Lucky (Full Disco Edit)',
      artist: 'Daft Punk',
      genre_id: 'electronic',
      audio_url: 'https://archive.org/download/20210320_20210320_1445/Get%20Lucky.mp3',
      cover_url:
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
      duration: 382,
    },
    {
      id: 'track-lofi-1',
      title: 'Rainy Cafe Study (Full Session)',
      artist: 'Coffee & Rain',
      genre_id: 'lofi',
      audio_url:
        'https://archive.org/download/RainyCafeStudySession/Rainy%20Cafe%20Study%20Session.mp3',
      cover_url:
        'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80',
      duration: 341,
    },
  ];

  for (const t of tracks) {
    await Track.upsert(t);
  }
  console.log(`✓ Seeded ${tracks.length} full-length tracks.`);

  // 3. Seed Default Test User if not exists
  const testEmail = 'alex.chen@anaska.ai';
  const existingUser = await User.findOne({ where: { email: testEmail } });

  if (!existingUser) {
    const passwordHash = await bcrypt.hash('CyberSonic2026!', 10);
    await User.create({
      id: crypto.randomUUID(),
      username: 'Alex Chen',
      email: testEmail,
      password_hash: passwordHash,
      avatar:
        'https://lh3.googleusercontent.com/aida/AEtjO1XP_iArmtIhjhiyVjnOz_wbxgz4w6FadVtnDF9CUOwqb8rQa6DsoOGOaU8kXsmXnGyYnxYse-1lbqwJD7uLxjStj2nqij7LLHMDQC9988-Jx9PiTFK9adAhN6_WczfOvOXU_bINh1fNpY78AvDHhe4ei8Sl-s3IDvTYb8kUnOzUcP3zbyDPSs7ryp-OPGk8kymKU89uDEBpht3WtXnoWFjwYZbqCg7A4mgxXW3lO70mkhFe1jJn5rrecw',
      genre_preferences: ['synthwave', 'rock', 'metal', 'electronic'],
    });
    console.log('✓ Seeded demo user: Alex Chen (alex.chen@anaska.ai)');
  }

  console.log('✅ Database seeded successfully with full-length music.');
}
