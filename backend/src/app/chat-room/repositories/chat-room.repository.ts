import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; 
import { CreateChatRoomDto } from '../dto/create-chat-room.dto';
import { ISendMessageProps, IJoinChatProps, ILeaveChatProps, IUser } from 'src/@types/interfaces';
import { ConflictError } from 'src/common/errors/types/ConflictError';
import { encryptData } from 'src/util/crypt';
import { ChatRoomMember } from '@prisma/client';

@Injectable()
export class ChatRoomRepository {
  constructor(private readonly prisma: PrismaService) {}
  private readonly systemEmail = process.env.SYSTEM_USER_EMAIL;
  
  async create(create_chat_room_dto: CreateChatRoomDto) {
    const systemUserPass = await encryptData(process.env.SYSTEM_USER_PASSWORD);

    const chatRoom = await this.prisma.chatRoom.create({
      data: {
        name: create_chat_room_dto.name,
        category: create_chat_room_dto.category,
        description: create_chat_room_dto.description,
        created_by_id: create_chat_room_dto.created_by
      },
    });

    const systemUser = await this.prisma.user.upsert({
      where: { email: 'system@chat.avenant.com' },
      update: {},
      create: {
        name: 'System',
        email: this.systemEmail,
        password: systemUserPass
      },
    });

    const newRoom = await this.prisma.chatRoomMember.create({
      data: {
        id_chat_room: chatRoom.id_chat_room,
        id_user: systemUser.id_user,
      },
    });

    return {
      rooms: this.prisma.chatRoom.findMany(),
      created_room: newRoom
    };
  }

  async findAll() {
    let chatRooms = await this.prisma.chatRoom.findMany();
    chatRooms = await Promise.all(chatRooms.map(async chatRoom => {
      const membersCount = await this.prisma.chatRoomMember.count({
        where: {
          id_chat_room: chatRoom.id_chat_room
        }
      })

      const lastSentMessage = await this.prisma.chatMessages.findFirst({
        where: {
          id_chat_room: chatRoom.id_chat_room
        },
        orderBy: {
          sent_at: 'desc', 
        },
      })
  
      return {
        ...chatRoom,
        members_count: membersCount,
        last_activity: lastSentMessage.sent_at
      }
    }))

    return chatRooms;
  }

  async findById(id_chat_room: number) {
    const chatRoom = await this.prisma.chatRoom.findFirst({
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

    const members = await this.prisma.chatRoomMember.findMany({
      where: {
        id_chat_room: chatRoom.id_chat_room,
        NOT: {
          user: {
            email: this.systemEmail,
          }
        },
      }, 
      include: {
        user: {
          select: {
            id_user: true,
            name: true,
            email: true,
            avatar_url: true,
            is_online: true,
            created_at: true
          }
        }
      }
    })

    const lastSentMessage = await this.prisma.chatMessages.findFirst({
      where: {
        id_chat_room: chatRoom.id_chat_room
      },
      orderBy: {
        sent_at: 'desc', 
      },
    })

    const chatRoomUpdated = {
      ...chatRoom,
      members_count: members.length,
      last_activity: lastSentMessage?.sent_at
    }

    return {
      chat_room: chatRoomUpdated,
      members
    }
  }

  async getSystemChatMember(id_chat_room: number) {
    const systemUser = await this.prisma.user.findFirst({
      where: {
        email: this.systemEmail
      }
    });

    return this.prisma.chatRoomMember.findFirst({
      where: {
        id_chat_room,
        id_user: systemUser.id_user
      },
      include: {
        user: {
          select: {
            id_user: true,
            name: true,
            email: true,
            avatar_url: true,
            is_online: true,
            created_at: true
          }
        }
      }
    });


  }

  async getChatRoomMembers(id_chat_room: number) {
    const chatRoomMembers = await this.prisma.chatRoomMember.findMany({
      where: {
        id_chat_room,
        NOT: {
          user: {
            email: this.systemEmail,
          }
        },
      },
      include: {
        user: {
          select: {
            id_user: true,
            name: true,
            email: true,
            avatar_url: true,
            is_online: true,
            created_at: true
          }
        }
      },
    });

    return chatRoomMembers;
  }

  async getChatRoomMessages(id_chat_room: number, limit = 150) {
    const chatRoomMessages = await this.prisma.chatMessages.findMany({
      where: {
        id_chat_room,
      },
      include: {
        chat_room_member: {
          include: {
            user: {
              select: {
                id_user: true,
                name: true,
                email: true,
                avatar_url: true,
                is_online: true,
                created_at: true
              }
            }
          },
        },
      },
      take: limit
    });

    const formattedMessages = chatRoomMessages.map((msg) => ({
      ...msg,
      user: msg.chat_room_member.user,
    }));

    return formattedMessages;
  }

  async getUserRooms(id_user: number) {
    const userRooms = await this.prisma.chatRoomMember.findMany({
      where: {
        id_user,
      }
    });

    const updatedUserRooms = await Promise.all(userRooms.map(async (room) => {
      const lastSentMessage = await this.prisma.chatMessages.findFirst({
        where: {
          id_chat_room: room.id_chat_room
        },
        orderBy: {
          sent_at: 'desc', 
        },
      })

      return {
        ...room,
        lastActivity: lastSentMessage.sent_at
      }
    }))

    return updatedUserRooms;
  }

  async sendMessage(message_infos_props: ISendMessageProps) {
    let chatMember: ChatRoomMember & { user: IUser }
    
    if(message_infos_props.user_email && message_infos_props.user_email === this.systemEmail) {
      chatMember = await this.getSystemChatMember(message_infos_props.id_chat_room)
    } else {
      chatMember = await this.prisma.chatRoomMember.findFirst({
        where: {
          id_user: message_infos_props.id_user,
          id_chat_room: message_infos_props.id_chat_room,
        },
        include: {
          user: {
            select: {
              id_user: true,
              name: true,
              email: true,
              avatar_url: true,
              is_online: true,
              created_at: true
            }
          }
        }
      });
    }

    if (!chatMember) {
      throw new Error("User doesn't belong in this room.");
    }

    const newMessage = await this.prisma.chatMessages.create({
      data: {
        content: message_infos_props.content,
        id_chat_room: message_infos_props.id_chat_room,
        id_chat_room_member: chatMember.id_chat_room_member
      }
    });

    return { ...newMessage, user: chatMember.user };
  }

  async join({ id_chat_room, id_user } : IJoinChatProps) {
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
        user: {
          select: {
            id_user: true,
            name: true,
            email: true,
            avatar_url: true,
            is_online: true,
            created_at: true
          }
        }
      }
    });

    return newChatRoomMember;
  }

  async leave({ id_chat_room, id_user } : ILeaveChatProps) {
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
        user: {
          select: {
            id_user: true,
            name: true,
            email: true,
            avatar_url: true,
            is_online: true,
            created_at: true
          }
        }
      }
    });

    return removedChatRoomMember;
  }
}
