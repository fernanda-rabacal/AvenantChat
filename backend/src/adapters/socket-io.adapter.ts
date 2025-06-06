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
    const clientURL = this.configService.get('CLIENT_URL');
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
          clientURL,
          new RegExp(`^http://192\\.168\\.1\\.([1-9]|[1-9]\\d):${clientPort}$`),
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

    const chatNamespace = server.of('/chat-room');
    
    chatNamespace.use((socket: any, next) => {
      this.logger.debug('🔑 Chat room middleware executing');
      return createTokenMiddleware(jwtService, this.logger)(socket, next);
    });

    return server;
  }
}

const createTokenMiddleware =
  (jwtService: JwtService, logger: Logger) =>
  (socket: SocketWithAuth, next: (err?: Error) => void) => {
    logger.debug('🔒 Token middleware start');

    const token = socket.handshake.auth.token || socket.handshake.headers['token'];

    if (!token) {
      logger.debug('❌ No token provided in middleware');
      return next(new Error('No token provided'));
    }
  
    logger.debug(`🔍 Validating token: ${token.substring(0, 10)}...`);

    try {
      const user = jwtService.verify(token);
      logger.debug('✅ Token verified successfully');

      socket.id_user = user.id_user;
      socket.id_chat_room = user.id_chat_room;

      next();
    } catch (err) {
      logger.debug('❌ Token verification failed');
      const customErr = new UnauthorizedError('Invalid token');
      logger.warn(customErr.message);

      next(new Error(customErr.message));
    }
  };