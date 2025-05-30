import { INestApplicationContext, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { ServerOptions, Server } from 'socket.io';
import { createClient } from 'redis';
import { SocketWithAuth } from '../@types/socket-with-auth'; 

export class RedisIOAdapter extends IoAdapter {
  private readonly logger = new Logger(RedisIOAdapter.name);

  constructor(
    private app: INestApplicationContext,
    private configService: ConfigService,
  ) {
    super(app);
  }

  async createIOServer(port: number, options?: ServerOptions): Promise<Server> {
    const clientPort = parseInt(this.configService.get('CLIENT_PORT'), 10);

    const cors = {
      origin: [
        `http://localhost:${clientPort}`,
        new RegExp(`^http:\\/\\/192\\.168\\.1\\.\\d+:${clientPort}$`),
      ],
    };

    this.logger.log('Configuring Socket.IO server with CORS and Redis adapter.');

    const optionsWithCORS: ServerOptions = {
      ...options,
      cors,
    };

    const jwtService = this.app.get(JwtService);
    const server: Server = super.createIOServer(port, optionsWithCORS);

    server.of('chat_rooms').use(createTokenMiddleware(jwtService, this.logger));

    const redisHost = this.configService.get('REDIS_HOST') || 'localhost';
    const redisPort = parseInt(this.configService.get('REDIS_PORT'), 10) || 6379;

    const pubClient = createClient({ socket: { host: redisHost, port: redisPort } });
    const subClient = pubClient.duplicate();

    await pubClient.connect();
    await subClient.connect();

    server.adapter(createAdapter(pubClient, subClient));

    return server;
  }
}

const createTokenMiddleware =
  (jwtService: JwtService, logger: Logger) =>
  (socket: SocketWithAuth, next) => {
    const token =
      socket.handshake.auth.token || socket.handshake.headers['token'];

    logger.debug(`Validating auth token before connection: ${token}`);

    try {
      const payload = jwtService.verify(token);
      socket.id_user = payload.sub;
      socket.name = payload.name;
      next();
    } catch (err) {
      logger.warn('Invalid JWT Token');
      next(new Error('FORBIDDEN'));
    }
  };
