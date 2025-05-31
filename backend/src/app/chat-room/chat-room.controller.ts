import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { UpdateChatRoomDto } from './dto/update-chat-room.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { AuthTokenDto } from '../auth/dto/auth-token.dto';

@Controller('chat-room')
export class ChatRoomController {
  constructor(private readonly chatRoomService: ChatRoomService) {}

  @Post()
  create(@Body() createChatRoomDto: CreateChatRoomDto) {
    return this.chatRoomService.create(createChatRoomDto);
  }

  @Get()
  findAll() {
    return this.chatRoomService.findAll();
  }

  @Get('/:id_chat_room')
  findById(@Param('id_chat_room') id_chat_room: number) {
    return this.chatRoomService.findById(+id_chat_room);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/join')
  async join(@Req() req: Request  & { user: AuthTokenDto }, @Body() id_chat_room: number) {
    return this.chatRoomService.joinChatRoom({ id_chat_room, id_user: req.user.id_user });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/leave')
  async leave(@Req() req: Request  & { user: AuthTokenDto }, @Body() id_chat_room: number) {
    return this.chatRoomService.leaveChatRoom({ id_chat_room, id_user: req.user.id_user });
  }
}
