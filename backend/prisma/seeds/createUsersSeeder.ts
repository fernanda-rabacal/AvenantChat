import { PrismaClient } from '@prisma/client';

export async function createUsers(prisma: PrismaClient) {
  await prisma.user.createMany({
    data: [
      {
        name: 'Gabriel Mayan',
        email: 'mayan@hotmail.com',
        password: '123456'
      },
    ],
  });
}
