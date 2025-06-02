import { IJoinChatProps, ILeaveChatProps, ISendMessageProps } from '../../@types/interfaces';
import { Injectable } from '@nestjs/common';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { ChatRoomRepository } from './repositories/chat-room.repository';

@Injectable()
export class ChatRoomService {
  constructor(
    private readonly repository: ChatRoomRepository
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

  async getChatRoomMembers(id_chat_room: number) {
    return this.repository.getChatRoomMembers(id_chat_room)
  }

  async getChatRoomMessages(id_chat_room: number) {
    return this.repository.getChatRoomMessages(id_chat_room)
  }

  async getUserRooms(id_user: number) {
    return this.repository.getUserRooms(id_user)
  }

  async joinChatRoom(join_chat_props: IJoinChatProps) {
    return this.repository.join(join_chat_props)
  }

  async leaveChatRoom(leave_chat_props: ILeaveChatProps) {
    return this.repository.leave(leave_chat_props)
  }

  async sendMessage(message_infos_props: ISendMessageProps) {
    return this.repository.sendMessage(message_infos_props)
  }

  async editMessage(new_message: string, id_message: number) {
    return this.repository.editMessage(new_message, id_message)
  }

  async deleteMessage(id_message: number) {
    return this.repository.deleteMessage(id_message)
  }
}
