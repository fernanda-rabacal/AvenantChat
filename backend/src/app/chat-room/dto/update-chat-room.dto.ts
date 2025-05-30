import { PartialType } from '@nestjs/mapped-types';
import { CreateChatRoomDto } from './create-chat-room.dto';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateChatRoomDto extends PartialType(CreateChatRoomDto) {
  @IsNumber()
  @IsNotEmpty()
  id_chat_room: number;
}
