import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthPayload, SocketWithAuth } from './../../../@types/socket-with-auth';

@Injectable()
export class GatewayAdminGuard implements CanActivate {
  private readonly logger = new Logger(GatewayAdminGuard.name);
  constructor(
    private readonly jwtService: JwtService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // regular `Socket` from socket.io is probably sufficient
    const socket: SocketWithAuth = context.switchToWs().getClient();

    const token =
      socket.handshake.auth.token || socket.handshake.headers['token'];

    if (!token) {
      this.logger.error('No authorization token provided');

      throw new UnauthorizedException('No authorization token provided');
    }

    try {
      const user = this.jwtService.verify<AuthPayload>(
        token,
      );

      this.logger.debug(`Validating admin using token payload`, user);

      if (!user) {
        throw new UnauthorizedException('Not logged');
      }

      socket.user = user;
      socket.id_user = user.id_user;
      socket.name = user.name;

      return true;
    } catch (err: unknown) {
      this.logger.error('Token validation failed', err);
      throw new UnauthorizedException('Token is invalid or expired');
    }
  }
}