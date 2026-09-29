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
    { id: 'synthwave', name: 'Synthwave & Retrowave' },
    { id: 'lofi', name: 'Lo-Fi Chill & Beats' },
    { id: 'electronic', name: 'Electronic & Dance' },
    { id: 'ambient', name: 'Ambient & Deep Focus' },
    { id: 'rock', name: 'Alternative & Indie Rock' },
    { id: 'metal', name: 'Heavy Metal & Industrial' },
    { id: 'hiphop', name: 'Hip-Hop & R&B' },
  ];
  for (const g of genres) {
    await pool.query('INSERT INTO genres (id, name) VALUES ($1, $2)', [g.id, g.name]);
  }

  // Seed default tracks with real famous artist tracks and working audio previews
  const tracks = [
    {
      id: 'track-synth-1',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      genre_id: 'synthwave',
      audio_url: 'https://cdnt-preview.dzcdn.net/api/1/1/1/b/2/0/1b24bfd27d7801be9c81121d556ad29a.mp3?hdnea=exp=1790686379~acl=/api/1/1/1/b/2/0/1b24bfd27d7801be9c81121d556ad29a.mp3*~data=user_id=0,application_id=42~hmac=5066c1f1ec76fe36d4df6c35c6fe29b69b6db9490218f4305bc56d7870a31189',
      cover_url: 'https://cdn-images.dzcdn.net/images/cover/fd00ebd6d30d7253f813dba3bb1c66a9/500x500-000000-80-0-0.jpg',
      duration: 200,
    },
    {
      id: 'track-synth-2',
      title: 'Nightcall',
      artist: 'Kavinsky',
      genre_id: 'synthwave',
      audio_url: 'https://cdnt-preview.dzcdn.net/api/1/1/4/e/d/0/4ed3505bf7fe64906f3b0e35928ea111.mp3?hdnea=exp=1790686379~acl=/api/1/1/4/e/d/0/4ed3505bf7fe64906f3b0e35928ea111.mp3*~data=user_id=0,application_id=42~hmac=c6cf048c1a638140db5c10adfdc14dfc684cf05c6d36e2f1816f1945ae74e2d3',
      cover_url: 'https://cdn-images.dzcdn.net/images/cover/7f9ecda862091716e4e8f74a7e115f93/500x500-000000-80-0-0.jpg',
      duration: 259,
    },
    {
      id: 'track-synth-3',
      title: 'Sunset',
      artist: 'The Midnight',
      genre_id: 'synthwave',
      audio_url: 'https://cdnt-preview.dzcdn.net/api/1/1/1/0/0/0/1004ea1fa2dcf2366872a08ee00eb3ef.mp3?hdnea=exp=1790686379~acl=/api/1/1/1/0/0/0/1004ea1fa2dcf2366872a08ee00eb3ef.mp3*~data=user_id=0,application_id=42~hmac=559779dfecbb6bb4a59f5926ec037b42aa15516087570ae5058ec693bb446fd0',
      cover_url: 'https://cdn-images.dzcdn.net/images/cover/e0066bf9a8972179679f2fe428987b22/500x500-000000-80-0-0.jpg',
      duration: 326,
    },
    {
      id: 'track-elec-1',
      title: 'Get Lucky',
      artist: 'Daft Punk',
      genre_id: 'electronic',
      audio_url: 'https://cdnt-preview.dzcdn.net/api/1/1/1/b/f/0/1bf80a82992903ff685ba1b7275223f8.mp3?hdnea=exp=1790686379~acl=/api/1/1/1/b/f/0/1bf80a82992903ff685ba1b7275223f8.mp3*~data=user_id=0,application_id=42~hmac=c77c46278fdae5a69b3e957590b4a8d47fbc8918bde2fb126db51d8b956b4d71',
      cover_url: 'https://cdn-images.dzcdn.net/images/cover/bc49adb87758e0c8c4e508a9c5cce85d/500x500-000000-80-0-0.jpg',
      duration: 248,
    },
    {
      id: 'track-elec-2',
      title: 'One More Time',
      artist: 'Daft Punk',
      genre_id: 'electronic',
      audio_url: 'https://cdnt-preview.dzcdn.net/api/1/1/f/8/c/0/f8c5dc3837912dba37c9a1ab3170cc3f.mp3?hdnea=exp=1790686379~acl=/api/1/1/f/8/c/0/f8c5dc3837912dba37c9a1ab3170cc3f.mp3*~data=user_id=0,application_id=42~hmac=3ec12563bb7aee4d06060fd6fc74cf297037e59d4e784144d0249de9cd8493ea',
      cover_url: 'https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg',
      duration: 320,
    },
    {
      id: 'track-elec-3',
      title: 'Strobe',
      artist: 'Deadmau5',
      genre_id: 'electronic',
      audio_url: 'https://cdnt-preview.dzcdn.net/api/1/1/5/3/e/0/53e4918b38de34f44dbb6a58f9b0fa78.mp3?hdnea=exp=1790686379~acl=/api/1/1/5/3/e/0/53e4918b38de34f44dbb6a58f9b0fa78.mp3*~data=user_id=0,application_id=42~hmac=e70e89e13114e3b383577006543c881f822341a635ea988e8893049620badee1',
      cover_url: 'https://cdn-images.dzcdn.net/images/cover/fb96300330027d5e4706a948c1bbe05a/500x500-000000-80-0-0.jpg',
      duration: 633,
    },
    {
      id: 'track-rock-1',
      title: 'Smells Like Teen Spirit',
      artist: 'Nirvana',
      genre_id: 'rock',
      audio_url: 'https://cdnt-preview.dzcdn.net/api/1/1/3/d/2/0/3d2a3f27ac62143f8204d1b81cac2ae7.mp3?hdnea=exp=1790686379~acl=/api/1/1/3/d/2/0/3d2a3f27ac62143f8204d1b81cac2ae7.mp3*~data=user_id=0,application_id=42~hmac=ffcf1091c4aededaf3ab63c7d9a21763bd8edc198e7949fbab2d4f76a1f669d3',
      cover_url: 'https://cdn-images.dzcdn.net/images/cover/10e6b28ed3ec7c157844b3187d0ac2f4/500x500-000000-80-0-0.jpg',
      duration: 289,
    },
    {
      id: 'track-rock-2',
      title: 'Do I Wanna Know?',
      artist: 'Arctic Monkeys',
      genre_id: 'rock',
      audio_url: 'https://cdnt-preview.dzcdn.net/api/1/1/3/3/9/0/339cc719f030b698ee5fe6a78ea5e36e.mp3?hdnea=exp=1790686379~acl=/api/1/1/3/3/9/0/339cc719f030b698ee5fe6a78ea5e36e.mp3*~data=user_id=0,application_id=42~hmac=3a070112673932a8841333bfe8a94354d53dd2e71748e9ccfef50c7b63385e1c',
      cover_url: 'https://cdn-images.dzcdn.net/images/cover/aa8ea17eb50583c3ee24e3989385f963/500x500-000000-80-0-0.jpg',
      duration: 281,
    },
    {
      id: 'track-rock-3',
      title: 'In the End',
      artist: 'Linkin Park',
      genre_id: 'rock',
      audio_url: 'https://cdnt-preview.dzcdn.net/api/1/1/9/b/3/0/9b3b33fa47f00eb43729de30e8027afa.mp3?hdnea=exp=1790686379~acl=/api/1/1/9/b/3/0/9b3b33fa47f00eb43729de30e8027afa.mp3*~data=user_id=0,application_id=42~hmac=9f52057bbdecf01c183cdcfbc789a2b3c7ee9f1a4ea371b9693d2b5e5768a187',
      cover_url: 'https://cdn-images.dzcdn.net/images/cover/033a271b5ec10842c287827c39244fb5/500x500-000000-80-0-0.jpg',
      duration: 216,
    },
    {
      id: 'track-rock-4',
      title: 'Bohemian Rhapsody',
      artist: 'Queen',
      genre_id: 'rock',
      audio_url: 'https://cdnt-preview.dzcdn.net/api/1/1/5/f/9/0/5f9a6a2ea1876e6d07c4b7feefa99951.mp3?hdnea=exp=1790686379~acl=/api/1/1/5/f/9/0/5f9a6a2ea1876e6d07c4b7feefa99951.mp3*~data=user_id=0,application_id=42~hmac=aafd7c4a6cf7514ce7d18e29ed5ea349de80781ad571c2a24ed3ced1d42d95ec',
      cover_url: 'https://cdn-images.dzcdn.net/images/cover/0b56f4eee05fa1ea753c5654b2cdb70c/500x500-000000-80-0-0.jpg',
      duration: 354,
    },
    {
      id: 'track-metal-1',
      title: 'Master Of Puppets',
      artist: 'Metallica',
      genre_id: 'metal',
      audio_url: 'https://cdnt-preview.dzcdn.net/api/1/1/7/d/e/0/7dee9f3fe45b02061a324bc8f3904d1b.mp3?hdnea=exp=1790686379~acl=/api/1/1/7/d/e/0/7dee9f3fe45b02061a324bc8f3904d1b.mp3*~data=user_id=0,application_id=42~hmac=d38a947de3fc2a9594e06c863c99f95881d9cc85de75064f9933859ea674a791',
      cover_url: 'https://cdn-images.dzcdn.net/images/cover/291e2af9295ca885b154eee75dfa0432/500x500-000000-80-0-0.jpg',
      duration: 515,
    },
    {
      id: 'track-metal-2',
      title: 'Enter Sandman',
      artist: 'Metallica',
      genre_id: 'metal',
      audio_url: 'https://cdnt-preview.dzcdn.net/api/1/1/c/7/0/0/c70d7e81abc196d915aadd1e7489a75a.mp3?hdnea=exp=1790686379~acl=/api/1/1/c/7/0/0/c70d7e81abc196d915aadd1e7489a75a.mp3*~data=user_id=0,application_id=42~hmac=e5ac01ea6280f1bdebcef55fc859dcdc505527b2ad43d90b2bbedd927119b6ec',
      cover_url: 'https://cdn-images.dzcdn.net/images/cover/4f2093c9d25852c8f1937ae5a47b99a6/500x500-000000-80-0-0.jpg',
      duration: 331,
    },
    {
      id: 'track-metal-3',
      title: 'Duality',
      artist: 'Slipknot',
      genre_id: 'metal',
      audio_url: 'https://cdnt-preview.dzcdn.net/api/1/1/0/7/1/0/071903d9430ded2ec139793ad3e9c09d.mp3?hdnea=exp=1790686379~acl=/api/1/1/0/7/1/0/071903d9430ded2ec139793ad3e9c09d.mp3*~data=user_id=0,application_id=42~hmac=8e9768a259a12ec9c17ae1995df05377200fb3c2f354693713574fd2ef5ccf13',
      cover_url: 'https://cdn-images.dzcdn.net/images/cover/35b093d22fe1539003d5d18dd8f309eb/500x500-000000-80-0-0.jpg',
      duration: 252,
    },
    {
      id: 'track-metal-4',
      title: 'The Trooper',
      artist: 'Iron Maiden',
      genre_id: 'metal',
      audio_url: 'https://cdnt-preview.dzcdn.net/api/1/1/4/2/7/0/4272d737754f446ba683534fd6b19502.mp3?hdnea=exp=1790686379~acl=/api/1/1/4/2/7/0/4272d737754f446ba683534fd6b19502.mp3*~data=user_id=0,application_id=42~hmac=6c51f21f7b3ddc37e2fa3cc654ac0645742852b9a84958048208894fc8b4a844',
      cover_url: 'https://cdn-images.dzcdn.net/images/cover/f4df1d0cc2d586cefd98dde8da717acd/500x500-000000-80-0-0.jpg',
      duration: 250,
    },
    {
      id: 'track-hiphop-1',
      title: 'HUMBLE.',
      artist: 'Kendrick Lamar',
      genre_id: 'hiphop',
      audio_url: 'https://cdnt-preview.dzcdn.net/api/1/1/5/9/c/0/59c7208affd26e5d728f03dd312dc4cd.mp3?hdnea=exp=1790686379~acl=/api/1/1/5/9/c/0/59c7208affd26e5d728f03dd312dc4cd.mp3*~data=user_id=0,application_id=42~hmac=f3de8f5d3e334ca7ad42ef848d86a4512ad58ea878b5a1f0b19cb4fadf05cd88',
      cover_url: 'https://cdn-images.dzcdn.net/images/cover/7ce6b8452fae425557067db6e6a1cad5/500x500-000000-80-0-0.jpg',
      duration: 177,
    },
    {
      id: 'track-hiphop-2',
      title: 'SICKO MODE',
      artist: 'Travis Scott',
      genre_id: 'hiphop',
      audio_url: 'https://cdnt-preview.dzcdn.net/api/1/1/b/9/7/0/b97402f4426864d46acd235a7146895c.mp3?hdnea=exp=1790686379~acl=/api/1/1/b/9/7/0/b97402f4426864d46acd235a7146895c.mp3*~data=user_id=0,application_id=42~hmac=0896c3584608c448a4f7a05b4bf2e63939a734bb8474dd25e3d36f6179934a7d',
      cover_url: 'https://cdn-images.dzcdn.net/images/cover/0b08015216f975dc7fb5be3d5dcc4d88/500x500-000000-80-0-0.jpg',
      duration: 312,
    },
    {
      id: 'track-lofi-1',
      title: 'Chill Lofi Beats',
      artist: 'Lofi Fruits Music',
      genre_id: 'lofi',
      audio_url: 'https://cdnt-preview.dzcdn.net/api/1/1/a/5/9/0/a59e94295e23f1be729461b3123552b5.mp3?hdnea=exp=1790686379~acl=/api/1/1/a/5/9/0/a59e94295e23f1be729461b3123552b5.mp3*~data=user_id=0,application_id=42~hmac=496150989dd30acae674d0530374ade3c5d4c533b88364e564f85e58566aa055',
      cover_url: 'https://cdn-images.dzcdn.net/images/cover/e094cf048f5b2e99425dc489eec68c4d/500x500-000000-80-0-0.jpg',
      duration: 220,
    },
    {
      id: 'track-amb-1',
      title: 'Awake',
      artist: 'Tycho',
      genre_id: 'ambient',
      audio_url: 'https://cdnt-preview.dzcdn.net/api/1/1/d/1/2/0/d1294470ca5e1373876115e9b48f94c1.mp3?hdnea=exp=1790686379~acl=/api/1/1/d/1/2/0/d1294470ca5e1373876115e9b48f94c1.mp3*~data=user_id=0,application_id=42~hmac=f01ae9c312fddcfdeca99e24d093dab2a549a0c97e08462174ff584b904168ce',
      cover_url: 'https://cdn-images.dzcdn.net/images/cover/99a031579197a567b508f0d6d5aad955/500x500-000000-80-0-0.jpg',
      duration: 283,
    },
    {
      id: 'track-amb-2',
      title: 'An Ending (Ascent)',
      artist: 'Brian Eno',
      genre_id: 'ambient',
      audio_url: 'https://cdnt-preview.dzcdn.net/api/1/1/3/1/8/0/318bb1ea9095cd18107e27c7d05a584b.mp3?hdnea=exp=1790686379~acl=/api/1/1/3/1/8/0/318bb1ea9095cd18107e27c7d05a584b.mp3*~data=user_id=0,application_id=42~hmac=6ae14a32cb515bbcf754543c7febb23b34ae2bac3c80037f07355c78c1665075',
      cover_url: 'https://cdn-images.dzcdn.net/images/cover/0b5598cea4e3e0043088a82167a2d34d/500x500-000000-80-0-0.jpg',
      duration: 265,
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
