import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

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
    description: 'Un mundo abierto enorme para explorar, con libertad total para resolver cada desafío a tu manera.',
    coverImage: 'https://placehold.co/600x900/1f2937/f9fafb?text=Breath+of+the+Wild',
    releaseDate: new Date('2017-03-03'),
    genre: 'Adventure',
  },
  {
    title: 'Elden Ring',
    description: 'Acción RPG desafiante con combate exigente, exploración libre y un mundo oscuro de fantasía.',
    coverImage: 'https://placehold.co/600x900/111827/f9fafb?text=Elden+Ring',
    releaseDate: new Date('2022-02-25'),
    genre: 'RPG',
  },
  {
    title: 'Baldur\'s Gate 3',
    description: 'RPG táctico con decisiones profundas, narrativa reactiva y combate por turnos.',
    coverImage: 'https://placehold.co/600x900/0f172a/f8fafc?text=Baldur%27s+Gate+3',
    releaseDate: new Date('2023-08-03'),
    genre: 'RPG',
  },
  {
    title: 'Hades',
    description: 'Roguelike de acción rápido, estiloso y muy rejugable, con una historia que avanza en cada intento.',
    coverImage: 'https://placehold.co/600x900/7c2d12/fef3c7?text=Hades',
    releaseDate: new Date('2020-09-17'),
    genre: 'Action',
  },
  {
    title: 'Hollow Knight',
    description: 'Metroidvania atmosférico con combate preciso, exploración y una dirección artística sobresaliente.',
    coverImage: 'https://placehold.co/600x900/312e81/e0e7ff?text=Hollow+Knight',
    releaseDate: new Date('2017-02-24'),
    genre: 'Metroidvania',
  },
  {
    title: 'Celeste',
    description: 'Plataformas exigente y emocional, con controles finos y un diseño de niveles muy pulido.',
    coverImage: 'https://placehold.co/600x900/7f1d1d/fef2f2?text=Celeste',
    releaseDate: new Date('2018-01-25'),
    genre: 'Platformer',
  },
  {
    title: 'Stardew Valley',
    description: 'Simulador de granja relajante con gestión, exploración, pesca y mucho contenido a largo plazo.',
    coverImage: 'https://placehold.co/600x900/14532d/ecfccb?text=Stardew+Valley',
    releaseDate: new Date('2016-02-26'),
    genre: 'Simulation',
  },
  {
    title: 'The Witcher 3: Wild Hunt',
    description: 'RPG narrativo con misiones memorables, mundo vivo y una de las historias más queridas del género.',
    coverImage: 'https://placehold.co/600x900/4b5563/f9fafb?text=The+Witcher+3',
    releaseDate: new Date('2015-05-18'),
    genre: 'RPG',
  },
  {
    title: 'Red Dead Redemption 2',
    description: 'Aventura western con mundo abierto detallado, historia fuerte y una ambientación muy cuidada.',
    coverImage: 'https://placehold.co/600x900/7f1d1d/fef2f2?text=Red+Dead+2',
    releaseDate: new Date('2018-10-26'),
    genre: 'Action-Adventure',
  },
  {
    title: 'God of War Ragnar\u00f6k',
    description: 'Acción cinemática con combate contundente, exploración y narrativa centrada en Kratos y Atreus.',
    coverImage: 'https://placehold.co/600x900/1e3a8a/dbeafe?text=God+of+War+Ragnarok',
    releaseDate: new Date('2022-11-09'),
    genre: 'Action-Adventure',
  },
  {
    title: 'Resident Evil 4',
    description: 'Survival horror con acción tensa, ritmo excelente y una campaña muy rejugable.',
    coverImage: 'https://placehold.co/600x900/991b1b/fef2f2?text=Resident+Evil+4',
    releaseDate: new Date('2023-03-24'),
    genre: 'Survival Horror',
  },
  {
    title: 'Death Stranding',
    description: 'Experiencia singular de exploración, conexión y logística en un mundo extraño y atmosférico.',
    coverImage: 'https://placehold.co/600x900/334155/e2e8f0?text=Death+Stranding',
    releaseDate: new Date('2019-11-08'),
    genre: 'Adventure',
  },
  {
    title: 'Minecraft',
    description: 'Sandbox de construcción y supervivencia donde casi todo lo que imaginas se puede hacer.',
    coverImage: 'https://placehold.co/600x900/166534/f0fdf4?text=Minecraft',
    releaseDate: new Date('2011-11-18'),
    genre: 'Sandbox',
  },
  {
    title: 'Portal 2',
    description: 'Puzzle en primera persona con humor, diseño brillante y una campaña cooperativa muy sólida.',
    coverImage: 'https://placehold.co/600x900/0f766e/f0fdfa?text=Portal+2',
    releaseDate: new Date('2011-04-19'),
    genre: 'Puzzle',
  },
  {
    title: 'Titanfall 2',
    description: 'Shooter con movilidad rápida, combate fluido y una campaña muy recordada por sus niveles.',
    coverImage: 'https://placehold.co/600x900/1d4ed8/eff6ff?text=Titanfall+2',
    releaseDate: new Date('2016-10-28'),
    genre: 'Shooter',
  },
];

async function main() {
  await prisma.game.deleteMany();
  await prisma.game.createMany({
    data: games,
  });

  console.log(`Seed completed: ${games.length} games created.`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
