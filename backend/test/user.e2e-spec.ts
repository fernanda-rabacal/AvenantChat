import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../src/app/user/user.service';
import { PrismaModule } from '../src/db/prisma.module';
import { AuthModule } from '../src/app/auth/auth.module';
import { UserModule } from '../src/app/user/user.module';
import { INestApplication } from '@nestjs/common';
import { CreateUserDto } from '../src/app/user/dto/create-user.dto';
import { UserRepository } from '../src/app/user/repositories/user.repository';
import * as request from 'supertest';
import { IUser } from '../src/@types/interfaces';
import { PrismaService } from '../src/db/prisma.service';
import { encryptData } from '../src/util/crypt';
import { cleanupDatabase } from './test-setup';
import { PrismaClient } from '@prisma/client';
import { ValidationPipe } from '@nestjs/common';

describe('UserController', () => {
  let app: INestApplication;
  let module: TestingModule;
  let users: IUser[];
  let prisma: PrismaClient;

  beforeAll(async () => {
    try {
      prisma = globalThis.__TEST_DB__.prisma;

      module = await Test.createTestingModule({
        imports: [PrismaModule, AuthModule, UserModule],
        providers: [
          UserService,
          UserRepository,
          {
            provide: PrismaService,
            useValue: prisma,
          },
        ],
      }).compile();

      app = module.createNestApplication();
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: false,
          transform: true,
        }),
      );
      await app.init();

      await prisma.user.upsert({
        where: { email: 'emailteste@email.com' },
        update: {},
        create: {
          name: 'Test User',
          email: 'emailteste@email.com',
          password: await encryptData('123456'),
        },
      });
    } catch (error) {
      console.error('Error setting up test database:', error);
      throw error;
    }
  });

  beforeEach(async () => {
    await cleanupDatabase(prisma);
    
    await prisma.user.upsert({
      where: { email: 'emailteste@email.com' },
      update: {},
      create: {
        name: 'Test User',
        email: 'emailteste@email.com',
        password: await encryptData('123456'),
      },
    });

    users = await prisma.user.findMany();
  });

  afterAll(async () => {
    try {
      if (app) {
        await app.close();
      }
      if (module) {
        await module.close();
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  });

  describe('POST /login', () => {
    it('should login', async () => {
      const res = await request(app.getHttpServer())
        .post('/login')
        .send({
          email: 'emailteste@email.com',
          password: '123456',
        })
        .expect(200);

      expect(res.body.token).toBeDefined();
      expect(res.body.type).toBeDefined();
    });

    it('should throw a NotFoundError on login', async () => {
      const res = await request(app.getHttpServer())
        .post('/login')
        .send({
          email: 'wrongemail@email.com',
          password: '123456',
        })
        .expect(401);

      expect(res.body.message).toBe('Invalid Credentials');
    });

    it('should reject login with incorrect password', async () => {
      const res = await request(app.getHttpServer())
        .post('/login')
        .send({
          email: 'emailteste@email.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(res.body.message).toBe('Invalid Credentials');
    });
  });

  describe('POST /users', () => {
    it('should create a user', async () => {
      const newUser = {
        name: 'Teste usuário 2',
        email: 'emailteste2@email.com',
        password: '123456',
      };

      const res = await request(app.getHttpServer())
        .post('/users')
        .send(newUser)
        .expect(201);
      expect(res.body.id_user).toBeDefined();
      expect(res.body.created_at).toBeDefined();
      expect(res.body.name).toEqual(newUser.name);
      expect(res.body.email).toEqual(newUser.email);
    });
  });

  describe('GET /users', () => {
    it('should list all users', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/login')
        .send({
          email: 'emailteste@email.com',
          password: '123456',
        });

      const res = await request(app.getHttpServer())
        .get('/users')
        .auth(loginResponse.body.token, { type: loginResponse.body.type })
        .expect(200);
      expect(res.body[0].id_user).toBeDefined();
      expect(res.body[0].name).toEqual(users[0].name);
      expect(res.body[0].email).toEqual(users[0].email);
      expect(res.body[0].created_at).toBeDefined();
      res.body.map((item: IUser) =>
        expect(item).toEqual({
          id_user: item.id_user,
          name: item.name,
          email: item.email,
          created_at: item.created_at,
          avatar_url: null,
          is_online: false,
        }),
      );
    });
  });

  describe('GET /users/:id_user', () => {
    it('should get an user by id', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/login')
        .send({
          email: 'emailteste@email.com',
          password: '123456',
        });

      const res = await request(app.getHttpServer())
        .get(`/users/${users[0].id_user}`)
        .auth(loginResponse.body.token, { type: loginResponse.body.type })
        .expect(200);
      expect(res.body.id_user).toEqual(users[0].id_user);
      expect(res.body.name).toEqual(users[0].name);
      expect(res.body.email).toEqual(users[0].email);
    });
  });

  describe('PATCH /users/:id_user', () => {
    const updateData = {
      name: 'New name',
    };

    it('should update an user by id', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/login')
        .send({
          email: 'emailteste@email.com',
          password: '123456',
        });

      const res = await request(app.getHttpServer())
        .patch(`/users/${users[0].id_user}`)
        .auth(loginResponse.body.token, { type: loginResponse.body.type })
        .send(updateData)
        .expect(200);
      expect(res.body.id_user).toEqual(users[0].id_user);
      expect(res.body.name).toEqual(updateData.name);
      expect(res.body.email).toEqual(users[0].email);
    });

    it('should throw an UnauthorizedError', async () => {
      await request(app.getHttpServer())
        .patch(`/users/${users[0].id_user}`)
        .send(updateData)
        .expect(401);
    });
  });

  describe('GET /users/chats/:id_user', () => {
    it('should get all user rooms', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/login')
        .send({
          email: 'emailteste@email.com',
          password: '123456',
        });

      const res = await request(app.getHttpServer())
        .get(`/users/chats/${users[0].id_user}`)
        .auth(loginResponse.body.token, { type: loginResponse.body.type })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('id_chat_room');
        expect(res.body[0]).toHaveProperty('name');
        expect(res.body[0]).toHaveProperty('created_at');
        expect(res.body[0]).toHaveProperty('updated_at');
      }
    });

    it('should return empty array when user has no rooms', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/login')
        .send({
          email: 'emailteste@email.com',
          password: '123456',
        });

      const res = await request(app.getHttpServer())
        .get(`/users/chats/999999`)
        .auth(loginResponse.body.token, { type: loginResponse.body.type })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(0);
    });
  });

  describe('PATCH /users/:id_user/connection-state', () => {
    it('should update user connection state to connected', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/login')
        .send({
          email: 'emailteste@email.com',
          password: '123456',
        });

      const res = await request(app.getHttpServer())
        .patch(`/users/${users[0].id_user}/connection-state`)
        .auth(loginResponse.body.token, { type: loginResponse.body.type })
        .send({ connection_state: 'connected' })
        .expect(200);

      expect(res.body).toHaveProperty('id_user');
      expect(res.body).toHaveProperty('is_online', true);
    });

    it('should update user connection state to disconnected', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/login')
        .send({
          email: 'emailteste@email.com',
          password: '123456',
        });

      const res = await request(app.getHttpServer())
        .patch(`/users/${users[0].id_user}/connection-state`)
        .auth(loginResponse.body.token, { type: loginResponse.body.type })
        .send({ connection_state: 'disconnected' })
        .expect(200);

      expect(res.body).toHaveProperty('id_user');
      expect(res.body).toHaveProperty('is_online', false);
    });

    it('should throw an error for invalid connection state', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/login')
        .send({
          email: 'emailteste@email.com',
          password: '123456',
        });

      const res = await request(app.getHttpServer())
        .patch(`/users/${users[0].id_user}/connection-state`)
        .auth(loginResponse.body.token, { type: loginResponse.body.type })
        .send({ connection_state: 'invalid' })
        .expect(400);

      expect(res.body.message).toEqual(['Connection state must be either "connected" or "disconnected"']);
    });
  });
});
