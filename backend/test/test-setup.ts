import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import { PostgreSqlContainer } from '@testcontainers/postgresql';

// Singleton instance
let globalPrisma: PrismaClient | null = null;
let globalContainer: any = null;

export default async function setup() {
  try {
    if (!globalContainer) {
      globalContainer = await new PostgreSqlContainer('postgres:16-alpine')
        .withStartupTimeout(120000)
        .start();
    }
    
    const databaseUrl = globalContainer.getConnectionUri();
    process.env.DATABASE_URL = databaseUrl;

    if (!globalPrisma) {
      globalPrisma = new PrismaClient({
        datasources: {
          db: {
            url: databaseUrl,
          },
        },
        log: ['error', 'warn'],
      });

      await globalPrisma.$connect();

      execSync('npx prisma db push --force-reset --accept-data-loss', { 
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: databaseUrl },
      });
    }

    // Set up global test database object
    globalThis.__TEST_DB__ = {
      container: globalContainer,
      prisma: globalPrisma,
    };
  } catch (error) {
    console.error('Error in test setup:', error);
    await teardownTestDatabase();
    throw error;
  }
}

export async function cleanupDatabase(prisma: PrismaClient) {
  if (!prisma) return;

  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  if (tables.length) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    } catch (error) {
      console.error('Error cleaning database:', error);
    }
  }
}

export async function teardownTestDatabase() {
  try {
    if (globalPrisma) {
      await cleanupDatabase(globalPrisma);
      await globalPrisma.$disconnect();
      globalPrisma = null;
    }
  } catch (error) {
    console.error('Error disconnecting Prisma:', error);
  }

  try {
    if (globalContainer) {
      await globalContainer.stop();
      globalContainer = null;
    }
  } catch (error) {
    console.error('Error stopping container:', error);
  }
} 