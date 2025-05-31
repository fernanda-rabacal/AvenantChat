import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; 
import { CreateChatRoomDto } from '../dto/create-chat-room.dto';
import { ChatProps, MessageProps, SendMessageProps } from 'src/@types/chat-rooms';
import { ConflictError } from 'src/common/errors/types/ConflictError';
import { encryptData } from 'src/util/crypt';
import { ChatRoomMember, Prisma, User } from '@prisma/client';

@Injectable()
export class ChatRoomRepository {
  constructor(private readonly prisma: PrismaService) {}
  private readonly systemName = 'System';

  async create(createChatRoomDto: CreateChatRoomDto) {
    const systemUserPass = await encryptData(process.env.SYSTEM_USER_PASSWORD);

    const chatRoom = await this.prisma.chatRoom.create({
      data: {
        name: createChatRoomDto.name,
        category: createChatRoomDto.category,
        description: createChatRoomDto.description,
        created_by_id: createChatRoomDto.created_by
      },
    });

    const systemUser = await this.prisma.user.upsert({
      where: { email: 'system@chat.local' },
      update: {},
      create: {
        name: this.systemName,
        email: 'system@chat.local',
        password: systemUserPass
      },
    });

    await this.prisma.chatRoomMember.create({
      data: {
        id_chat_room: chatRoom.id_chat_room,
        id_user: systemUser.id_user,
      },
    });

    return chatRoom;
  }

  async findAll() {
    const chatRooms = await this.prisma.chatRoom.findMany();

    return chatRooms;
  }

  async findById(id_chat_room: number) {
    const chatRoom = await this.prisma.chatRoom.findUnique({
      where: {
        id_chat_room,
      },
      include: {
        ChatRoomMembers: {
          include: {
            ChatMessages: true
          }
        },
      }
    });

    return chatRoom;
  }

  async getSystemChatMember(id_chat_room: number) {
    const systemUser = await this.prisma.user.findFirst({
      where: {
        name: this.systemName
      }
    });

    return this.prisma.chatRoomMember.findFirst({
      where: {
        id_chat_room,
        id_user: systemUser.id_user
      },
      include: {
        user: true
      }
    });
  }

  async getUsersInRoom(id_chat_room: number) {
    const chatRoomMembers = await this.prisma.chatRoomMember.findMany({
      where: {
        id_chat_room,
      }
    });

    return chatRoomMembers;
  }

  async getUserRooms(id_user: number) {
    const userRooms = await this.prisma.chatRoomMember.findMany({
      where: {
        id_user,
      }
    });

    return userRooms;
  }

  async sendMessage(message_infos: SendMessageProps) {
    let chatMember: ChatRoomMember & { user: User }
    
    if(message_infos.user_name && message_infos.user_name === this.systemName) {
      chatMember = await this.getSystemChatMember(message_infos.id_chat_room)
    } else {
      chatMember = await this.prisma.chatRoomMember.findFirst({
        where: {
          id_user: message_infos.id_user,
          id_chat_room: message_infos.id_chat_room,
        },
        include: {
          user: true
        }
      });
    }

    if (!chatMember) {
      throw new Error("User doesn't belong in this room.");
    }

    const newMessage = await this.prisma.chatMessages.create({
      data: {
        content: message_infos.content,
        chat_room_member: {
          connect: { 
            id_chat_room_member: chatMember.id_chat_room_member
          },
        },
      }
    });

    return { ...newMessage, name: chatMember.user.name };
  }

  async join({ id_chat_room, id_user } : ChatProps) {
    const chatRoomsMember = await this.prisma.chatRoomMember.findFirst({
      where: {
        id_chat_room,
        id_user
      }
    })

    if (chatRoomsMember) {
      throw new ConflictError('User is already on chat room')
    }

    const newChatRoomMember = await this.prisma.chatRoomMember.create({
      data: {
        id_chat_room,
        id_user
      },
      include: {
        chat_room: true,
        user: true
      }
    });

    return newChatRoomMember;
  }

  async leave({ id_chat_room, id_user} : ChatProps) {
   const chatRoomsMember = await this.prisma.chatRoomMember.findFirst({
      where: {
        id_chat_room,
        id_user
      }
    })

    if (!chatRoomsMember) {
      throw new ConflictError('User is already off chat room')
    }

    const removedChatRoomMember = await this.prisma.chatRoomMember.delete({
      where: {
        id_chat_room_member: chatRoomsMember.id_chat_room_member
      },
      include: {
        chat_room: true,
        user: true
      }
    });

    return removedChatRoomMember;
  }
}
