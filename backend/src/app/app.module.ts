import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ChatRoomModule } from './chat-room/chat-room.module';
import { ConfigModule } from '@nestjs/config';
import { ChatRoomGateway } from './chat-room/chat-room.gateway';
import { RedisModule } from './redis.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule, 
    ChatRoomModule,
    RedisModule,
    AuthModule],
  controllers: [],
  providers: [ChatRoomGateway],
})
export class AppModule {}
