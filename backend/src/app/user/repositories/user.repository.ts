import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; 
import { CreateUserDto } from '../dto/create-user.dto';
import { encryptData } from '../../../util/crypt';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}
  private readonly systemEmail = process.env.SYSTEM_USER_EMAIL;

  async create(create_user_dto: CreateUserDto) {
    const user = this.prisma.user.create({
      data: {
        name: create_user_dto.name,
        email: create_user_dto.email,
        password: await encryptData(create_user_dto.password),
      },
    });

    return user;
  }

  async findAll() {
    const users = await this.prisma.user.findMany();

    const usersWithoutPassword = users.map(user => {
      const { password, ...rest } = user;
      return rest;
    });

    return usersWithoutPassword;
  }

  async findById(id_user: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id_user,
      },
    });

    const { password, ...rest } = user;

    return rest;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: email,
      }
    });

    return user;
  }

  async getUserRooms(id_user: number) {
    const userAsMember = await this.prisma.chatRoomMember.findMany({
      where: {
        id_user,
        NOT: {
          user: {
            email: this.systemEmail,
          }
        },
      }
    });

    const chatRoomsIds = Array.from(new Set(userAsMember.map(member => member.id_chat_room)))
    const rooms = await this.prisma.chatRoom.findMany({
      where: {
        id_chat_room: {
          in: chatRoomsIds
        }
      }
    })

    return rooms;
  }

  async saveUserConnectState(id_user: number, connection_state: 'connected' | 'disconnected') {
    const user = await this.prisma.user.update({
      data: {
        is_online: connection_state === 'connected' ? true : false
      },
      where: {
        id_user,
      },
    });

    return user;
  }

  async update(id_user: number, update_user_dto: UpdateUserDto) {
    const data: {
      name?: string,
      password?: string
    } = {};

    if (update_user_dto.name) data.name = update_user_dto.name;
    if (update_user_dto.password) data.password = await encryptData(update_user_dto.password);

    const user = await this.prisma.user.update({
      data,
      where: {
        id_user,
      },
    });

    return user;
  }
}
