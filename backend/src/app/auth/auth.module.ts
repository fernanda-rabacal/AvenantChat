import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserRepository } from '../user/repositories/user.repository';
import { ChatRoomService } from '../chat-room/chat-room.service';
import { ChatRoomRepository } from '../chat-room/repositories/chat-room.repository';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.SECRET,
    }),
  ],
  controllers: [AuthController],
  providers: [
    PrismaService,
    AuthService,
    JwtStrategy,
    LocalStrategy,
    UserService,
    UserRepository,
    ChatRoomService,
    ChatRoomRepository
  ],
  exports: [JwtModule],
})
export class AuthModule {}
