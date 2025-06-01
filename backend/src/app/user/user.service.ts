import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './repositories/user.repository';
import { NotFoundError } from 'src/common/errors/types/NotFoundError';

@Injectable()
export class UserService {
  constructor(private readonly repository: UserRepository) {}

  async create(create_user_dto: CreateUserDto) {
    return this.repository.create(create_user_dto);
  }

  async findAll() {
    const users = await this.repository.findAll();

    if (users.length == 0) {
      throw new HttpException([], HttpStatus.NO_CONTENT);
    }

    return users;
  }

  async findById(id_user: number) {
    const user = this.repository.findById(id_user);

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

  async getUserRooms(id_user: number) {
    return this.repository.getUserRooms(id_user);
  }

  async saveUserConnectState(id_user: number, connection_state: 'connected' | 'disconnected') {
    return this.repository.saveUserConnectState(id_user, connection_state)
  }

  async update(id_user: number, update_user_dto: UpdateUserDto) {
    return this.repository.update(id_user, update_user_dto);
  }
}
