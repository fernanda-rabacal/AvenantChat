import { INestApplicationContext, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import { SocketWithAuth } from 'src/@types/socket-with-auth';
import { UnauthorizedError } from 'src/common/errors/types/UnauthorizedError';

export class SocketIOAdapter extends IoAdapter {
  private readonly logger = new Logger(SocketIOAdapter.name);
  constructor(
    private app: INestApplicationContext,
    private configService: ConfigService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const clientPort = parseInt(this.configService.get('CLIENT_PORT'));
    const isTest = process.env.NODE_ENV === 'test';

    this.logger.debug(`Creating IO Server on port ${port}`);
    this.logger.debug(`Test mode: ${isTest}`);

    const cors = {
      origin: isTest 
        ? true 
        : [
            `http://localhost:${clientPort}`,
            `http://localhost:${clientPort + 1}`,
            `http://localhost:${clientPort + 2}`,
            `http://localhost:${clientPort + 3}`,
            new RegExp(`/^http:\/\/192\.168\.1\.([1-9]|[1-9]\d):${clientPort}$/`),
          ],
      credentials: true,
    };
    this.logger.log('Configuring SocketIO server with custom CORS options', {
      cors,
    });

    const optionsWithCORS: ServerOptions = {
      ...options,
      cors,
    };

    const jwtService = this.app.get(JwtService);
    const server: Server = super.createIOServer(port, optionsWithCORS);

    server.of('chat-rooms').use(createTokenMiddleware(jwtService, this.logger));

    return server;
  }
}

const createTokenMiddleware =
  (jwtService: JwtService, logger: Logger) =>
  (socket: SocketWithAuth, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers['token'];

    logger.debug(`Validating auth token before connection: ${token}`);

    try {
      const payload = jwtService.verify(token);

      socket.id_user = payload.id_user;
      socket.id_chat_room = payload.id_chat_room;
      next();
    } catch (err) {
      logger.warn('Invalid JWT Token');

      next(new UnauthorizedError('FORBIDDEN'));
    }
  };