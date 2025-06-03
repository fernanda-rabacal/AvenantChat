import { Controller, Get, Post, Body, Param, UseGuards, Req, Logger } from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { AuthTokenDto } from '../auth/dto/auth-token.dto';
import { Request } from 'express';

@Controller('chat-room')
export class ChatRoomController {
  constructor(private readonly chatRoomService: ChatRoomService) {}
  private readonly logger = new Logger(ChatRoomController.name);

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  create(@Body() create_chat_room_dto: CreateChatRoomDto) {
    try {
      return this.chatRoomService.create(create_chat_room_dto);
    } catch (err) {
      this.logger.error(err);

      throw err;
    }
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  findAll() {
    try {
      return this.chatRoomService.findAll();
    } catch (err) {
      this.logger.error(err);

      throw err;
    }
  }

  @Get('/:id_chat_room')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  findById(@Param('id_chat_room') id_chat_room: number) {
    try {
      return this.chatRoomService.findById(+id_chat_room);
    } catch (err) {
      this.logger.error(err);

      throw err;
    }
  }

  @Post('/join')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async join(@Req() req: Request & { user: AuthTokenDto }, @Body('id_chat_room') id_chat_room: number) {
    try {
      return this.chatRoomService.joinChatRoom({ id_chat_room, id_user: req.user.id_user });
    } catch (err) {
      this.logger.error(err);

      throw err;
    }
  }

  @Post('/leave')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async leave(@Req() req: Request & { user: AuthTokenDto }, @Body('id_chat_room') id_chat_room: number) {
    try {
      return this.chatRoomService.leaveChatRoom({ id_chat_room, id_user: req.user.id_user });
    } catch (err) {
      this.logger.error(err);

      throw err;
    }
  }
}
