import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthTokenDto } from '../dto/auth-token.dto';
import { UserService } from '../../../app/user/user.service'; 

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.NODE_ENV === 'test' ? 'test-secret' : process.env.SECRET,
    });
  }

  async validate(payload: AuthTokenDto) {
    if (!payload) {
      throw new UnauthorizedException('Não autenticado.');
    }

    const user = await this.userService.findById(payload.id_user);
    return user;
  }
}
