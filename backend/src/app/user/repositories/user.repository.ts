import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; 
import { CreateUserDto } from '../dto/create-user.dto';
import { encryptData } from '../../../util/crypt';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Prisma } from 'generated/prisma';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: await encryptData(createUserDto.password),
      },
    });

    return user;
  }

  async findAll() {
    const users = await this.prisma.user.findMany();

    const removePassword = users.map(user => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = user;

      return rest;
    });

    return removePassword;
  }

  async findById(id_user: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id_user,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  async update(id_user: number, updateUserDto: UpdateUserDto) {
    const data: Prisma.UserUpdateInput = {};

    if (updateUserDto.name) data.name = updateUserDto.name;
    if (updateUserDto.password) data.password = await encryptData(updateUserDto.password);

    const user = await this.prisma.user.update({
      data,
      where: {
        id_user,
      },
    });

    return user;
  }
}
