import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { io, Socket } from 'socket.io-client';
import { PrismaModule } from '../src/db/prisma.module';
import { AuthModule } from '../src/app/auth/auth.module';
import { ChatRoomModule } from '../src/app/chat-room/chat-room.module';
import { UserModule } from '../src/app/user/user.module';
import { CreateChatRoomDto } from '../src/app/chat-room/dto/create-chat-room.dto';
import { PrismaClient } from '@prisma/client';
import { ChatRoomService } from '../src/app/chat-room/chat-room.service';
import { ChatRoomRepository } from '../src/app/chat-room/repositories/chat-room.repository';
import { encryptData } from '../src/util/crypt';
import { IChatRoom } from '../src/@types/interfaces';
import { PrismaService } from '../src/db/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ChatRoomGateway } from '../src/app/chat-room/chat-room.gateway';

describe('ChatRoomController (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let authToken: string;
  let chatRoomData: CreateChatRoomDto;
  let createdChatRoom: IChatRoom;
  let clientSocket: Socket;
  let prisma: PrismaClient;
  let configService: ConfigService;

  beforeAll(async () => {
    prisma = globalThis.__TEST_DB__.prisma;

    const user = await prisma.user.upsert({
      where: { email: 'emailteste@email.com' },
      update: {},
      create: {
        name: 'Test User',
        email: 'emailteste@email.com',
        password: await encryptData('123456'),
      },
    });

    moduleFixture = await Test.createTestingModule({
      imports: [
        PrismaModule, 
        AuthModule,
        ChatRoomModule,
        UserModule,
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1d' },
        }),
      ],
      providers: [
        ChatRoomService, 
        ChatRoomRepository, 
        ChatRoomGateway,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        ConfigService,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    configService = app.get(ConfigService);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
      }),
    );

    app.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    await app.init();
    const httpServer = app.getHttpServer();
    const port = await new Promise<number>((resolve) => {
      const server = httpServer.listen(0, () => {
        resolve(server.address().port);
      });
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/login')
      .send({
        email: 'emailteste@email.com',
        password: '123456',
      });

    authToken = loginResponse.body.token;

    chatRoomData = {
      name: 'Test Chat Room',
      category: 'test',
      description: 'Test chat room description',
      created_by: user.id_user
    };

    const socketUrl = `http://localhost:${port}`;

    clientSocket = io(`${socketUrl}/chat-room`, {
      auth: {
        token: authToken,
      },
      autoConnect: false,
      transports: ['websocket'],
      forceNew: true,
      reconnection: false,
      timeout: 5000,
      path: '/socket.io'
    });

    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  beforeEach(async () => {

    await prisma.chatMessages.deleteMany();
    await prisma.chatRoomMember.deleteMany();
    await prisma.chatRoom.deleteMany();

    const createChatRoomResponse = await request(app.getHttpServer())
      .post('/chat-room')
      .auth(authToken, { type: 'bearer' })
      .send(chatRoomData);

    createdChatRoom = createChatRoomResponse.body.created_room;

    if (!clientSocket.connected) {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Socket connection timeout'));
        }, 2000);

        const onConnect = () => {
          clearTimeout(timeout);
          clientSocket.off('connect_error', onError);
          clientSocket.off('error', onError);
          resolve();
        };

        const onError = (error) => {
          clearTimeout(timeout);
          clientSocket.off('connect', onConnect);
          reject(error);
        };

        clientSocket.once('connect', onConnect);
        clientSocket.once('connect_error', onError);
        clientSocket.once('error', onError);

        clientSocket.connect();
      });
    }
  });

  afterEach(async () => {
    if (clientSocket?.connected) {
      await new Promise<void>((resolve) => {
        clientSocket.once('disconnect', () => {
          resolve();
        });
        clientSocket.disconnect();
      });
    }
  });

  afterAll(async () => {
    try {
      if (clientSocket?.connected) {
        clientSocket.disconnect();
      }
      await app.close();
      await moduleFixture.close();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  });

  describe('HTTP Endpoints', () => {
    describe('POST /chat-room', () => {
      it('should create a chat room', async () => {
        const response = await request(app.getHttpServer())
          .post('/chat-room')
          .auth(authToken, { type: 'bearer' })
          .send(chatRoomData)
          .expect(201);

        expect(response.body.created_room).toBeDefined();
        expect(response.body.created_room.name).toBe(chatRoomData.name);
        expect(response.body.rooms).toBeDefined();
        createdChatRoom = response.body.created_room;
      });
    });

    describe('GET /chat-room', () => {
      it('should return all chat rooms', async () => {
        const response = await request(app.getHttpServer())
          .get('/chat-room')
          .auth(authToken, { type: 'bearer' })
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body[0]).toHaveProperty('id_chat_room');
        expect(response.body[0]).toHaveProperty('name');
        expect(response.body[0]).toHaveProperty('members_count');
        expect(response.body[0]).toHaveProperty('last_activity');
      });
    });

    describe('GET /chat-room/:id_chat_room', () => {
      it('should return a specific chat room', async () => {
        const response = await request(app.getHttpServer())
          .get(`/chat-room/${createdChatRoom.id_chat_room}`)
          .auth(authToken, { type: 'bearer' })
          .expect(200);

        expect(response.body.chat_room).toBeDefined();
        expect(response.body.members).toBeDefined();
        expect(response.body.chat_room.id_chat_room).toBe(createdChatRoom.id_chat_room);
      });
    });

    describe('POST /chat-room/join', () => {
      it('should join a chat room', async () => {
        const response = await request(app.getHttpServer())
          .post('/chat-room/join')
          .auth(authToken, { type: 'bearer' })
          .send({ id_chat_room: createdChatRoom.id_chat_room })
          .expect(201);

        expect(response.body).toBeDefined();
        expect(response.body.id_chat_room).toBe(createdChatRoom.id_chat_room);
      });
    });

    describe('POST /chat-room/leave', () => {
      it('should leave a chat room', async () => {
        await request(app.getHttpServer())
          .post('/chat-room/join')
          .auth(authToken, { type: 'bearer' })
          .send({ id_chat_room: createdChatRoom.id_chat_room });

        const response = await request(app.getHttpServer())
          .post('/chat-room/leave')
          .auth(authToken, { type: 'bearer' })
          .send({ id_chat_room: createdChatRoom.id_chat_room })
          .expect(201);

        expect(response.body).toBeDefined();
        expect(response.body.id_chat_room).toBe(createdChatRoom.id_chat_room);
      });
    });
  });

  describe('WebSocket Events', () => {
    it('should connect to websocket', async () => {
      expect(clientSocket.connected).toBe(true);
    });

    it('should receive saved messages on connection with room', (done) => {
      const timeout = setTimeout(() => {
        done(new Error('Test timeout'));
      }, 2000);

      clientSocket.emit('join_chat', { id_chat_room: createdChatRoom.id_chat_room });

      clientSocket.once('saved_messages', (data) => {
        clearTimeout(timeout);
        expect(data.messages).toBeDefined();
        expect(Array.isArray(data.messages)).toBe(true);
        done();
      });
    });

    it('should send and receive messages', (done) => {
      const timeout = setTimeout(() => {
        done(new Error('Test timeout'));
      }, 2000);

      const messageData = {
        message: 'Test message',
        id_chat_room: createdChatRoom.id_chat_room,
        chat_room_name: createdChatRoom.name
      };

      clientSocket.emit('join_chat', { id_chat_room: createdChatRoom.id_chat_room });

      clientSocket.once('joined_room', () => {
        clientSocket.emit('message', messageData);

        clientSocket.once('message', (data) => {
          clearTimeout(timeout);
          expect(data.content).toBe(messageData.message);
          expect(data.id_chat_room).toBe(messageData.id_chat_room);
          done();
        });
      });
    });

    it('should edit messages', (done) => {
      const timeout = setTimeout(() => {
        done(new Error('Test timeout'));
      }, 2000);

      const messageData = {
        message: 'Test message',
        id_chat_room: createdChatRoom.id_chat_room,
        chat_room_name: createdChatRoom.name
      };

      clientSocket.emit('join_chat', { id_chat_room: createdChatRoom.id_chat_room });

      clientSocket.once('joined_room', () => {
        clientSocket.emit('message', messageData);

        clientSocket.once('message', (data) => {
          const editData = {
            new_message: 'Edited message',
            id_message: data.id_message
          };

          clientSocket.emit('edit_message', editData);

          clientSocket.once('message', (editedData) => {
            clearTimeout(timeout);
            expect(editedData.content).toBe(editData.new_message);
            expect(editedData.id_message).toBe(editData.id_message);
            done();
          });
        });
      });
    });

    it('should delete messages', (done) => {
      const messageData = {
        message: 'Test message to delete',
        id_chat_room: createdChatRoom.id_chat_room,
        chat_room_name: createdChatRoom.name
      };

      clientSocket.emit('join_chat', { id_chat_room: createdChatRoom.id_chat_room });

      clientSocket.once('joined_room', () => {
        clientSocket.emit('message', messageData);

        clientSocket.once('message', (data) => {
          expect(data.id_message).toBeDefined();
          expect(data.content).toBe(messageData.message);

          clientSocket.emit('delete_message', { id_message: data.id_message });

          clientSocket.once('message', (deletedData) => {
            try {
              expect(deletedData.id_message).toBe(data.id_message);
              expect(deletedData.is_deleted).toBe(true);
              expect(deletedData.content).toBe(messageData.message);
              done();
            } catch (err) {
              done(err);
            }
          });
        });
      });
    }, 20000);

    it('should handle entering chat rooms', (done) => {
      clientSocket.emit('enter_chat', { id_chat_room: createdChatRoom.id_chat_room });

      clientSocket.once('chat_room_members_list', (data) => {
        expect(data.chat_room_members).toBeDefined();
        expect(Array.isArray(data.chat_room_members)).toBe(true);
        done();
      });
    });

    it('should handle leaving chat rooms', (done) => {
      clientSocket.emit('join_chat', { id_chat_room: createdChatRoom.id_chat_room });

      clientSocket.once('joined_room', () => {
        clientSocket.emit('leave_chat', { id_chat_room: createdChatRoom.id_chat_room });

        clientSocket.once('user_rooms_list', (data) => {
          try {
            expect(Array.isArray(data.rooms)).toBe(true);
            expect(data.rooms.length).toBe(0);
            done();
          } catch (err) {
            done(err);
          }
        });
      });
    });

    it('should handle joining chat rooms', (done) => {
      request(app.getHttpServer())
        .post('/chat-room')
        .auth(authToken, { type: 'bearer' })
        .send(chatRoomData)
        .then((response) => {
          const newChatRoom = response.body.created_room;
          
          expect(newChatRoom).toBeDefined();
          expect(newChatRoom.id_chat_room).toBeDefined();
          expect(typeof newChatRoom.id_chat_room).toBe('number');
          expect(clientSocket.connected).toBe(true);
          
          clientSocket.emit('join_chat', { id_chat_room: newChatRoom.id_chat_room });

          clientSocket.once('joined_room', (data) => {
            try {
              expect(data.id_chat_room).toBe(newChatRoom.id_chat_room);
              expect(data.name).toBe(newChatRoom.name);
              expect(data.ChatRoomMembers).toBeDefined();
              expect(Array.isArray(data.ChatRoomMembers)).toBe(true);
              expect(data.ChatRoomMembers.length).toBeGreaterThan(0);
              done();
            } catch (err) {
              done(err);
            }
          });
        })
        .catch((err) => done(err));
    }, 15000);
  });
}); 