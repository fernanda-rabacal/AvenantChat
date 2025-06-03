import { Module } from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { ChatRoomController } from './chat-room.controller';
import { ChatRoomRepository } from './repositories/chat-room.repository';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { PrismaService } from '../../db/prisma.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { UserRepository } from '../user/repositories/user.repository';

@Module({
  imports: [JwtModule],
  controllers: [ChatRoomController],
  providers: [
    ChatRoomService, 
    ChatRoomRepository, 
    UserService, 
    UserRepository, 
    PrismaService, 
    JwtStrategy,
    JwtService,
  ],
  exports: [
    ChatRoomService
  ]
})
export class ChatRoomModule {}
