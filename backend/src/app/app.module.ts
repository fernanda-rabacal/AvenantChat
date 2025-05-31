import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ChatRoomModule } from './chat-room/chat-room.module';
import { ConfigModule } from '@nestjs/config';
import { ChatRoomGateway } from './chat-room/chat-room.gateway';
import { RedisModule } from './redis.module';

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule, 
    ChatRoomModule,
    RedisModule],
  controllers: [AppController],
  providers: [AppService, ChatRoomGateway],
})
export class AppModule {}
