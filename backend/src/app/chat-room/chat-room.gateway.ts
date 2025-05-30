import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { ChatRoomService } from './chat-room.service';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { UpdateChatRoomDto } from './dto/update-chat-room.dto';

@WebSocketGateway()
export class ChatRoomGateway {
  constructor(private readonly chatRoomService: ChatRoomService) {}

  @SubscribeMessage('createChatRoom')
  create(@MessageBody() createChatRoomDto: CreateChatRoomDto) {
    return this.chatRoomService.create(createChatRoomDto);
  }

  @SubscribeMessage('findAllChatRoom')
  findAll() {
    return this.chatRoomService.findAll();
  }

  @SubscribeMessage('findOneChatRoom')
  findOne(@MessageBody() id_chat_room: number) {
    return this.chatRoomService.findOne(id_chat_room);
  }

  @SubscribeMessage('updateChatRoom')
  update(@MessageBody() updateChatRoomDto: UpdateChatRoomDto) {
    return this.chatRoomService.update(updateChatRoomDto.id_chat_room, updateChatRoomDto);
  }

  @SubscribeMessage('removeChatRoom')
  remove(@MessageBody() id_chat_room: number) {
    return this.chatRoomService.remove(id_chat_room);
  }
}
