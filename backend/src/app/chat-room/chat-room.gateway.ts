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
import { AuthPayload, SocketWithAuth } from 'src/@types/socket-with-auth'; 
import { GatewayAdminGuard } from '../auth/guard/gateway.guard';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';

@UsePipes(new ValidationPipe())
@WebSocketGateway({
  namespace: 'chat-room',
})
export class ChatRoomGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly chatRoomService: ChatRoomService,
    private readonly usesrService: UserService,
    private readonly jwtService: JwtService,
  ) {}
  private readonly logger = new Logger(ChatRoomGateway.name);
  private readonly systemEmail = process.env.SYSTEM_USER_EMAIL;

  @WebSocketServer() io: Namespace;

  afterInit(): void {
    this.logger.log(`Websocket Gateway initialized.`);
  }

  async handleConnection(client: SocketWithAuth): Promise<void> {
    const sockets = this.io.sockets;
    const token = client.handshake.auth.token;
    const room = client.handshake.auth.room;

    if (!token) {
      this.logger.error('No token provided');
      client.disconnect();
      return;
    }

    try {
      const user = this.jwtService.verify<AuthPayload>(token);

      client.user = user;
      client.name = user.name;

      this.logger.debug(`Socket connected with userID: ${client.id_user} and name: "${client.name}"`);
      this.logger.log(`WS Client with id: ${client.id_user} connected!`);
      this.logger.debug(`Number of connected sockets: ${sockets.size}`);

      await this.usesrService.saveUserConnectState(client.user.id_user, 'connected')

      if (room && room.id_chat_room) {
        client.id_chat_room = room.id_chat_room;
        const roomName = `${room.chat_room_name}-${room.id_chat_room}`;

        client.join(roomName);

        const savedMessages = await this.chatRoomService.getChatRoomMessages(client.id_chat_room);
        
        this.io.to(roomName).emit('saved_messages', {
          messages: savedMessages.messages,
          hasMore: savedMessages.hasMore
        });
      }

      const userRooms = await this.chatRoomService.getUserRooms(client.user.id_user);
      userRooms.forEach(room => {
        const roomName = `${room.name}-${room.id_chat_room}`;
        
        this.io.to(roomName).emit('chat_room_members_list', { 
          chat_room_members: room.members
        });
      })

    } catch (error) {
      this.logger.error('Invalid token', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: SocketWithAuth): Promise<void> {
    const sockets = this.io.sockets;

    this.logger.log(`Disconnected socket id: ${client.id}`);
    this.logger.debug(`Number of connected sockets: ${sockets.size}`);
    
    this.usesrService.saveUserConnectState(client.user.id_user, 'disconnected');

    if (client.id_chat_room) {
      const connectedRoom = await this.chatRoomService.findById(client.id_chat_room)
      let connectedRoomName: string;
  
      if (connectedRoom) {
        connectedRoomName = `${connectedRoomName}-${client.id_chat_room}`;
        client.leave(connectedRoomName);
      }
    }

    const userRooms = await this.chatRoomService.getUserRooms(client.user.id_user);
    userRooms.forEach(room => {
      const roomName = `${room.name}-${room.id_chat_room}`;
      this.logger.log(roomName)
      
      this.io.to(roomName).emit('chat_room_members_list', { chat_room_members: room.members });
    })
  }

  @SubscribeMessage('message')
  @UseGuards(GatewayAdminGuard)
  async handleMessage(
    @MessageBody()
    payload: {
      message: string;
      id_chat_room: number;
      chat_room_name: string;
    }, 
    @ConnectedSocket() client: SocketWithAuth
  ): Promise<void> {
    const { message, id_chat_room, chat_room_name } = payload;
    const connectedRoomName = `${chat_room_name}-${id_chat_room}`;
    
    this.logger.debug(`userID: ${client.user.id_user} sent a message to room ${chat_room_name}: ${message}`);

    const savedMessage = await this.chatRoomService.sendMessage({
      id_chat_room,
      id_user: client.user.id_user,
      content: message
    });

    this.io.to(connectedRoomName).emit('message', savedMessage);
  }

  @SubscribeMessage('edit_message')
  @UseGuards(GatewayAdminGuard)
  async handleEditMessage(
    @MessageBody()
    payload: {
      new_message: string;
      id_message: number;
    }, 
    @ConnectedSocket() client: SocketWithAuth
  ): Promise<void> {
    this.logger.debug(`userID: ${client.user.id_user} is attempting to edit a message`);
    const { new_message, id_message } = payload;

    const connectedRoom = await this.chatRoomService.findById(client.id_chat_room);
    const connectedRoomName = `${connectedRoom.chat_room.name}-${connectedRoom.chat_room.id_chat_room}`;
    const editedMessage = await this.chatRoomService.editMessage(new_message, id_message);

    this.io.to(connectedRoomName).emit('message', editedMessage);
  }

  @SubscribeMessage('delete_message')
  @UseGuards(GatewayAdminGuard)
  async handleDeleteMessage(
    @MessageBody('id_message') id_message: number,
    @ConnectedSocket() client: SocketWithAuth
  ): Promise<void> {
    this.logger.debug(`userID: ${client.user.id_user} is attempting to delete a message`);

    const connectedRoom = await this.chatRoomService.findById(client.id_chat_room);
    const connectedRoomName = `${connectedRoom.chat_room.name}-${connectedRoom.chat_room.id_chat_room}`;
    
    const deletedMessage = await this.chatRoomService.deleteMessage(id_message);

    this.io.to(connectedRoomName).emit('message', deletedMessage);
  }

  @SubscribeMessage('enter_chat')
  @UseGuards(GatewayAdminGuard)
  async enterChatRoom(
    @MessageBody('id_chat_room') id_chat_room: number,
    @ConnectedSocket() client: SocketWithAuth,
  ): Promise<void> {
    this.logger.debug(`Attempting to enter chat`);
    
    let prevRoomName: string, newRoomName: string;

    if (client.id_chat_room) {
      const prevRoom = await this.chatRoomService.findById(client.id_chat_room);
  
      if(prevRoom) {
        prevRoomName = `${prevRoom.chat_room.name}-${client.id_chat_room}`;
        client.leave(prevRoomName);
      }
    }

    const newChatRoom = await this.chatRoomService.findById(id_chat_room);
    const chatRoomMembers = await this.chatRoomService.getChatRoomMembers(id_chat_room);
    const savedMessages = await this.chatRoomService.getChatRoomMessages(id_chat_room);

    client.id_chat_room = newChatRoom.chat_room.id_chat_room;
    newRoomName = `${newChatRoom.chat_room.name}-${newChatRoom.chat_room.id_chat_room}`;

    client.join(newRoomName);

    this.io.to(newRoomName).emit('chat_room_members_list', { 
      chat_room_members: chatRoomMembers 
    });
    this.io.to(newRoomName).emit('saved_messages', {
      messages: savedMessages.messages,
      hasMore: savedMessages.hasMore
    });
  }

  @SubscribeMessage('leave_chat')
  @UseGuards(GatewayAdminGuard)
  async leaveChatRoom(@MessageBody('id_chat_room') id_chat_room: number, @ConnectedSocket() client: SocketWithAuth): Promise<void> {
    this.logger.debug(`Attempting to remove user ${client.user.id_user} from chat ${id_chat_room}`);

    const chatRoom = await this.chatRoomService.findById(id_chat_room);
    const roomName = `${chatRoom.chat_room.name}-${id_chat_room}`;
    const removedUser = await this.chatRoomService.leaveChatRoom({
      id_chat_room,
      id_user: client.user.id_user,
    });

    const userRooms = await this.chatRoomService.getUserRooms(client.user.id_user);
    const chatRoomMembers = await this.chatRoomService.getChatRoomMembers(id_chat_room);
    const savedMessage = await this.chatRoomService.sendMessage({
      id_user: client.user.id_user,
      id_chat_room,
      user_email: this.systemEmail,
      content: `${removedUser.user.name} has left the chat`
    });

    client.leave(roomName);
    client.id_chat_room = null;
    client.emit('user_rooms_list', { rooms: userRooms });
    this.io.to(roomName).emit('message', savedMessage);
    this.io.to(roomName).emit('chat_room_members_list', { chat_room_members: chatRoomMembers })
  }

  @SubscribeMessage('join_chat')
  @UseGuards(GatewayAdminGuard)
  async joinChatRoom(
    @MessageBody('id_chat_room') id_chat_room: number,
    @ConnectedSocket() client: SocketWithAuth,
  ): Promise<void> {
    this.logger.debug(`Attempting to add user ${client.user.id_user} in chat ${id_chat_room}`);

    if (client.id_chat_room) {
      const prevRoom = await this.chatRoomService.findById(client.id_chat_room);
  
      if(prevRoom) {
        const prevRoomName = `${prevRoom.chat_room.name}-${client.id_chat_room}`;
        client.leave(prevRoomName);
      }
    }

    const addedUser = await this.chatRoomService.joinChatRoom({
      id_chat_room,
      id_user: client.user.id_user,
    });

    const savedMessage = await this.chatRoomService.sendMessage({
      id_chat_room,
      id_user: client.user.id_user,
      user_email: this.systemEmail,
      content: `${addedUser.user.name} has joined the chat`
    });

    const room = await this.chatRoomService.findById(id_chat_room);
    const roomName = `${room.chat_room.name}-${id_chat_room}`;
    const userRooms = await this.chatRoomService.getUserRooms(client.user.id_user);
    const savedMessages = await this.chatRoomService.getChatRoomMessages(id_chat_room);
    
    client.id_chat_room = room.chat_room.id_chat_room;
    const joinedChatMessage = { 
      content: `You have joined the chat`, 
      user: {
        email: this.systemEmail, 
        name: 'System'
      },
      id_chat_room 
    };

    client.join(roomName);

    client.broadcast.to(roomName).emit('message', savedMessage);
    client.emit('message', joinedChatMessage);
    client.emit('user_rooms_list', { rooms: userRooms });
    client.emit(`joined_room`, room.chat_room);
    this.io.to(roomName).emit('saved_messages', {
      messages: savedMessages.messages,
      hasMore: savedMessages.hasMore
    });
    this.io.to(roomName).emit('chat_room_members_list', { chat_room_members: room.members });
  }

  @SubscribeMessage('load_more_messages')
  @UseGuards(GatewayAdminGuard)
  async loadMoreMessages(
    @MessageBody() payload: { id_chat_room: number; page: number },
    @ConnectedSocket() client: SocketWithAuth,
  ): Promise<void> {
    const { id_chat_room, page } = payload;
    
    this.logger.debug(`Loading more messages for chat ${id_chat_room}, page ${page}`);

    const chatRoom = await this.chatRoomService.findById(id_chat_room);
    const roomName = `${chatRoom.chat_room.name}-${id_chat_room}`;
    const messages = await this.chatRoomService.getChatRoomMessages(id_chat_room, page);

    client.emit('more_messages', messages);
  }
}