import { PrismaClient } from '@prisma/client';
import { createUsers } from './createUsersSeeder';

const prisma = new PrismaClient();

async function main() {
  await createUsers(prisma);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("prisma seed err >>", e);
    await prisma.$disconnect();
    process.exit(1);
  });
