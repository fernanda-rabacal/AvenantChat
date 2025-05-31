import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './repositories/user.repository';
import { NotFoundError } from 'src/common/errors/types/NotFoundError';

@Injectable()
export class UserService {
  constructor(private readonly repository: UserRepository) {}

  async create(createUserDto: CreateUserDto) {
    return this.repository.create(createUserDto);
  }

  async findAll() {
    const users = await this.repository.findAll();

    if (users.length == 0) {
      throw new HttpException([], HttpStatus.NO_CONTENT);
    }

    return users;
  }

  async findById(id: number) {
    const user = this.repository.findById(id);

    if (!user) {
      throw new NotFoundError('Usuário não encontrado.');
    }

    return user;
  }

  async findByEmail(email: string) {
    const user = this.repository.findByEmail(email);

    if (!user) {
      throw new NotFoundError('Usuário não encontrado.');
    }

    return user;
  }

  async update(userId: number, updateUserDto: UpdateUserDto) {
    return this.repository.update(userId, updateUserDto);
  }
}
