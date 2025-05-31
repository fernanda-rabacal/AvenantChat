import { ChatProps, MessageProps, SendMessageProps } from './../../@types/chat-rooms';
import { Injectable } from '@nestjs/common';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { ChatRoomRepository } from './repositories/chat-room.repository';
import { UserService } from '../user/user.service';

@Injectable()
export class ChatRoomService {
  constructor(
    private readonly repository: ChatRoomRepository,
    private readonly userService: UserService
  ) {}

  async create(create_chat_room_dto: CreateChatRoomDto) {
    return this.repository.create(create_chat_room_dto);
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id_chat_room: number) {
    return this.repository.findById(id_chat_room)
  }

  async getUsersInRoom(id_chat_room: number) {
    return this.repository.getUsersInRoom(id_chat_room)
  }

  async getUserRooms(id_user: number) {
    return this.repository.getUserRooms(id_user)
  }

  async joinChatRoom(join_chat_props: ChatProps) {
    return this.repository.join(join_chat_props)
  }

  async leaveChatRoom(join_chat_props: ChatProps) {
    return this.repository.leave(join_chat_props)
  }

  async sendMessage(message_infos: SendMessageProps) {
    return this.repository.sendMessage(message_infos)
  }
}
