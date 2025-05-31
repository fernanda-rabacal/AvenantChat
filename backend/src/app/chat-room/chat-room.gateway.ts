import {
  Logger,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  OnGatewayInit,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Namespace } from 'socket.io';
import { ChatRoomService } from './chat-room.service';
import { SocketWithAuth } from 'src/@types/socket-with-auth'; 
import { GatewayAdminGuard } from '../auth/guard/gateway.guard';

const ADMIN = 'Admin'

@UsePipes(new ValidationPipe())
@WebSocketGateway({
  namespace: 'chat-room',
})
export class ChatRoomGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChatRoomGateway.name);
  private readonly systemName = 'System';
  constructor(private readonly chatRoomService: ChatRoomService) {}

  @WebSocketServer() io: Namespace;

  afterInit(): void {
    this.logger.log(`Websocket Gateway initialized.`);
  }

  async handleConnection(client: SocketWithAuth): Promise<void> {
    const sockets = this.io.sockets;

    this.logger.debug(
      `Socket connected with userID: ${client.id_user} and name: "${client.name}"`,
    );

    this.logger.log(`WS Client with id: ${client.id_user} connected!`);
    this.logger.debug(`Number of connected sockets: ${sockets.size}`);
  }

  async handleDisconnect(client: SocketWithAuth): Promise<void> {
    const sockets = this.io.sockets;

    this.logger.log(`Disconnected socket id: ${client.id}`);
    this.logger.debug(`Number of connected sockets: ${sockets.size}`);
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() message: string, 
    client: SocketWithAuth
  ): Promise<void> {
    const { id_chat_room, id_user, name } = client;
    this.logger.debug(
      `userID: ${client.id_user} sent a message to room: ${name}`,
    );

    const savedMessage = await this.chatRoomService.sendMessage({
      id_user,
      id_chat_room,
      content: message
    });

    this.io.to(`${name}-${id_chat_room}`).emit('message', savedMessage);
  }

  @UseGuards(GatewayAdminGuard)
  @SubscribeMessage('leave_chat')
  async leaveChatRoom(
    @MessageBody('id') id: string,
    @ConnectedSocket() client: SocketWithAuth,
  ): Promise<void> {
    this.logger.debug(
      `Attempting to remove user ${id} from chat ${client.id_chat_room}`,
    );

    const { id_chat_room, id_user, name } = client;
    const removedUser = await this.chatRoomService.leaveChatRoom({
      id_chat_room,
      id_user,
    });

    const usersInRoom = await this.chatRoomService.getUsersInRoom(id_chat_room)

    client.broadcast.to(`${name}-${id_chat_room}`).emit('leave_chat', {
      message: `${removedUser.user.name} has left the chat`
    });
    this.io.to(`${name}-${id_chat_room}`).emit('user_list', { users: usersInRoom })
  }

  @UseGuards(GatewayAdminGuard)
  @SubscribeMessage('join_chat')
  async joinChatRoom(
    @MessageBody('id_chat_room') id_chat_room: number,
    @ConnectedSocket() client: SocketWithAuth,
  ): Promise<void> {
    this.logger.debug(
      `Attempting to add user ${client.id_user} in chat ${id_chat_room}`,
    );

    const { id_user } = client;
    const addedUser = await this.chatRoomService.joinChatRoom({
      id_chat_room,
      id_user,
    });

    const savedMessage = await this.chatRoomService.sendMessage({
      id_user,
      id_chat_room,
      user_name: this.systemName,
      content: `${addedUser.user.name} has joined the chat`
    });
    
    const roomName = addedUser.chat_room.name 
    const usersInRoom = await this.chatRoomService.getUsersInRoom(id_chat_room)
    const userRooms = await this.chatRoomService.getUserRooms(id_user)
    
    client.broadcast.to(`${roomName}-${id_chat_room}`).emit('message', savedMessage);
    client.emit('user_rooms_list', { rooms: userRooms })
    client.emit('message', { content: `You have joined the chat`, name: ADMIN })
    this.io.to(`${roomName}-${id_chat_room}`).emit('user_list', { users: usersInRoom })
  }
}