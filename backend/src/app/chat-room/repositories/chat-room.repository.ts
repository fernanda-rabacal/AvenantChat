import { Injectable } from '@nestjs/common';
import { ChatRoomMember } from '@prisma/client';

import { CreateChatRoomDto } from '../dto/create-chat-room.dto';
import { PrismaService } from '../../../db/prisma.service';
import { ISendMessageProps, IJoinChatProps, ILeaveChatProps, IUser } from '../../../@types/interfaces';
import { ConflictError } from '../../../common/errors/types/ConflictError';
import { encryptData } from '../../../util/crypt';
import { SystemError } from '../../../common/errors/types/SystemError';

@Injectable()
export class ChatRoomRepository {
  constructor(private readonly prisma: PrismaService) {}
  private readonly systemEmail = process.env.SYSTEM_USER_EMAIL;
  
  async create(create_chat_room_dto: CreateChatRoomDto) {
    const systemUserPass = await encryptData(process.env.SYSTEM_USER_PASSWORD);

    const newChatRoom = await this.prisma.chatRoom.create({
      data: {
        name: create_chat_room_dto.name,
        category: create_chat_room_dto.category,
        description: create_chat_room_dto.description,
        created_by_id: create_chat_room_dto.created_by
      },
    });

    const systemUser = await this.prisma.user.upsert({
      where: { email: this.systemEmail },
      update: {},
      create: {
        name: 'System',
        email: this.systemEmail,
        password: systemUserPass
      },
    });

    await this.prisma.chatRoomMember.upsert({
      where: { 
        id_chat_room_member: newChatRoom.id_chat_room,
        user: {
          id_user: create_chat_room_dto.created_by
        }
      }, 
      update: {},
      create: {
        id_chat_room: newChatRoom.id_chat_room,
        id_user: systemUser.id_user,
      },
    });

    return {
      rooms: await this.prisma.chatRoom.findMany(),
      created_room: newChatRoom
    };
  }

  async findAll() {
    let chatRooms = await this.prisma.chatRoom.findMany();

    chatRooms = await Promise.all(chatRooms.map(async chatRoom => {
      const membersCount = await this.prisma.chatRoomMember.count({
        where: {
          id_chat_room: chatRoom.id_chat_room,
          NOT: {
          user: {
            email: this.systemEmail,
          }
        },
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
        last_activity: lastSentMessage ? lastSentMessage.sent_at : chatRoom.created_at
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
          where: {
            NOT: {
              user: {
                email: this.systemEmail,
              }
            }
          },
        },
        ChatMessages: true
      }
    });

    if (!chatRoom) return;

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
      last_activity: lastSentMessage ? lastSentMessage.sent_at : chatRoom.created_at
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

    if (!systemUser) throw new SystemError("It was an error during getSystemChatMember function")

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

  async getChatRoomMessages(id_chat_room: number, page = 1, limit = 150) {
    const skip = (page - 1) * limit;

    const chatRoomMessages = await this.prisma.chatMessages.findMany({
      where: {
        id_chat_room,
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
        },
      },
      orderBy: {
        sent_at: 'desc'
      },
      skip,
      take: limit
    });

    return {
      messages: chatRoomMessages.reverse(),
      hasMore: chatRoomMessages.length === limit
    };
  }

  async getUserRooms(id_user: number) {
    const userRooms = await this.prisma.chatRoomMember.findMany({
      where: {
        id_user,
        NOT: {
          user: {
            email: this.systemEmail,
          }
        },
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

    const updatedUserRooms = await Promise.all(userRooms.map(async (room) => {
      const lastSentMessage = await this.prisma.chatMessages.findFirst({
        where: {
          id_chat_room: room.chat_room.id_chat_room
        },
        orderBy: {
          sent_at: 'desc', 
        },
      })
      const chatRoomMembers = await this.getChatRoomMembers(room.chat_room.id_chat_room)

      return {
        ...room.chat_room,
        members: chatRoomMembers,
        last_activity: lastSentMessage ? lastSentMessage.sent_at : room.chat_room.created_at
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
      });

      if (!chatMember) {
        throw new ConflictError("User doesn't belong in this room.");
      }
    }

    const newMessage = await this.prisma.chatMessages.create({
      data: {
        content: message_infos_props.content,
        id_chat_room: message_infos_props.id_chat_room,
        id_user: chatMember.id_user
      }
    });

    return { ...newMessage, user: chatMember.user };
  }

  async editMessage(new_message: string, id_message: number) {
    const newMessage = await this.prisma.chatMessages.update({
      where: {
        id_message
      },
      data: {
        content: new_message,
        edited_at: new Date()
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

    return newMessage;
  }

  async deleteMessage(id_message: number) {
    const newMessage = await this.prisma.chatMessages.update({
      where: {
        id_message
      },
      data: {
        is_deleted: true,
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

    return newMessage;
  }

  async join({ id_chat_room, id_user } : IJoinChatProps) {
    const chatRoomsMember = await this.prisma.chatRoomMember.findFirst({
      where: {
        id_chat_room,
        id_user,
        NOT: {
          user: {
            email: this.systemEmail,
          }
        },
      }
    })

    if (chatRoomsMember) {
      throw new ConflictError("User already in this room.");
    };

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
        id_user,
        NOT: {
          user: {
            email: this.systemEmail,
          }
        },
      }
    })

    if (!chatRoomsMember) {
      throw new ConflictError("User doesn't belong in this room.");
    };

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