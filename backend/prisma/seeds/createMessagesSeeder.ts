import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function createMessages(prisma: PrismaClient) {
  const user = await prisma.user.findFirst({
    where: {
      email: {
        not: process.env.SYSTEM_USER_EMAIL
      }
    }
  });

  if (!user) {
    throw new Error('No user found to create messages. Please run the user seeder first.');
  }

  const chatRoom = await prisma.chatRoom.create({
    data: {
      name: "Test Pagination Room",
      category: "test",
      description: "A room created for testing message pagination",
      created_by_id: user.id_user
    }
  });

  await prisma.chatRoomMember.create({
    data: {
      id_chat_room: chatRoom.id_chat_room,
      id_user: user.id_user
    }
  });

  const messages = Array.from({ length: 301 }, (_, i) => ({
    content: faker.lorem.sentence(),
    id_chat_room: chatRoom.id_chat_room,
    id_user: user.id_user,
    sent_at: new Date(Date.now() - (301 - i) * 60000) 
  }));

  await prisma.chatMessages.createMany({
    data: messages
  });
} 