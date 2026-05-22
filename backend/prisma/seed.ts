import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

const games = [
  {
    title: 'The Legend of Zelda: Breath of the Wild',
    description: 'A massive open world to explore, with complete freedom to solve every challenge your own way.',
    coverImage: 'https://placehold.co/600x900/1f2937/f9fafb?text=Breath+of+the+Wild',
    releaseDate: new Date('2017-03-03'),
    genre: 'Adventure',
  },
  {
    title: 'Elden Ring',
    description: 'A challenging action RPG with demanding combat, open exploration, and a dark fantasy world.',
    coverImage: 'https://placehold.co/600x900/111827/f9fafb?text=Elden+Ring',
    releaseDate: new Date('2022-02-25'),
    genre: 'RPG',
  },
  {
    title: 'Baldur\'s Gate 3',
    description: 'A tactical RPG with deep choices, reactive storytelling, and turn-based combat.',
    coverImage: 'https://placehold.co/600x900/0f172a/f8fafc?text=Baldur%27s+Gate+3',
    releaseDate: new Date('2023-08-03'),
    genre: 'RPG',
  },
  {
    title: 'Hades',
    description: 'A fast, stylish, highly replayable action roguelike with a story that advances on every run.',
    coverImage: 'https://placehold.co/600x900/7c2d12/fef3c7?text=Hades',
    releaseDate: new Date('2020-09-17'),
    genre: 'Action',
  },
  {
    title: 'Hollow Knight',
    description: 'An atmospheric metroidvania with precise combat, exploration, and outstanding art direction.',
    coverImage: 'https://placehold.co/600x900/312e81/e0e7ff?text=Hollow+Knight',
    releaseDate: new Date('2017-02-24'),
    genre: 'Metroidvania',
  },
  {
    title: 'Celeste',
    description: 'A demanding and emotional platformer with tight controls and highly polished level design.',
    coverImage: 'https://placehold.co/600x900/7f1d1d/fef2f2?text=Celeste',
    releaseDate: new Date('2018-01-25'),
    genre: 'Platformer',
  },
  {
    title: 'Stardew Valley',
    description: 'A relaxing farming simulator with management, exploration, fishing, and lots of long-term content.',
    coverImage: 'https://placehold.co/600x900/14532d/ecfccb?text=Stardew+Valley',
    releaseDate: new Date('2016-02-26'),
    genre: 'Simulation',
  },
  {
    title: 'The Witcher 3: Wild Hunt',
    description: 'A narrative RPG with memorable quests, a living world, and one of the genre’s most beloved stories.',
    coverImage: 'https://placehold.co/600x900/4b5563/f9fafb?text=The+Witcher+3',
    releaseDate: new Date('2015-05-18'),
    genre: 'RPG',
  },
  {
    title: 'Red Dead Redemption 2',
    description: 'A western adventure with a detailed open world, a strong story, and a carefully crafted atmosphere.',
    coverImage: 'https://placehold.co/600x900/7f1d1d/fef2f2?text=Red+Dead+2',
    releaseDate: new Date('2018-10-26'),
    genre: 'Action-Adventure',
  },
  {
    title: 'God of War Ragnar\u00f6k',
    description: 'Cinematic action with powerful combat, exploration, and a narrative centered on Kratos and Atreus.',
    coverImage: 'https://placehold.co/600x900/1e3a8a/dbeafe?text=God+of+War+Ragnarok',
    releaseDate: new Date('2022-11-09'),
    genre: 'Action-Adventure',
  },
  {
    title: 'Resident Evil 4',
    description: 'Survival horror with tense action, excellent pacing, and a highly replayable campaign.',
    coverImage: 'https://placehold.co/600x900/991b1b/fef2f2?text=Resident+Evil+4',
    releaseDate: new Date('2023-03-24'),
    genre: 'Survival Horror',
  },
  {
    title: 'Death Stranding',
    description: 'A unique experience of exploration, connection, and logistics in a strange, atmospheric world.',
    coverImage: 'https://placehold.co/600x900/334155/e2e8f0?text=Death+Stranding',
    releaseDate: new Date('2019-11-08'),
    genre: 'Adventure',
  },
  {
    title: 'Minecraft',
    description: 'A building and survival sandbox where almost anything you imagine is possible.',
    coverImage: 'https://placehold.co/600x900/166534/f0fdf4?text=Minecraft',
    releaseDate: new Date('2011-11-18'),
    genre: 'Sandbox',
  },
  {
    title: 'Portal 2',
    description: 'A first-person puzzle game with humor, brilliant design, and a very solid co-op campaign.',
    coverImage: 'https://placehold.co/600x900/0f766e/f0fdfa?text=Portal+2',
    releaseDate: new Date('2011-04-19'),
    genre: 'Puzzle',
  },
  {
    title: 'Titanfall 2',
    description: 'A shooter with fast movement, fluid combat, and a campaign remembered for its standout levels.',
    coverImage: 'https://placehold.co/600x900/1d4ed8/eff6ff?text=Titanfall+2',
    releaseDate: new Date('2016-10-28'),
    genre: 'Shooter',
  },
];

const users: Array<{
  username: string;
  email: string;
  password: string;
  role: Role;
}> = [
  {
    username: 'admin',
    email: 'admin@vaultgy.local',
    password: 'Admin123!@#',
    role: 'ADMIN',
  },
  {
    username: 'alice',
    email: 'alice@vaultgy.local',
    password: 'User123!@#',
    role: 'USER',
  },
  {
    username: 'bob',
    email: 'bob@vaultgy.local',
    password: 'User123!@#',
    role: 'USER',
  },
];

async function main() {
  await prisma.review.deleteMany();
  await prisma.libraryItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.game.deleteMany();
  await prisma.user.deleteMany();

  await prisma.game.createMany({
    data: games,
  });

  await prisma.user.createMany({
    data: await Promise.all(
      users.map(async (user) => ({
        username: user.username,
        email: user.email,
        password: await bcrypt.hash(user.password, 10),
        role: user.role,
      })),
    ),
  });

  console.log(
    `Seed completed: ${games.length} games created and ${users.length} users created.`,
  );
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
