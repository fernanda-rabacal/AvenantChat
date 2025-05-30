import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserRepository } from '../user/repositories/user.repository';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.SECRET,
    }),
  ],
  controllers: [AuthController],
  providers: [
    PrismaService,
    AuthService,
    JwtStrategy,
    UserService,
    UserRepository,
  ],
  exports: [JwtModule],
})
export class AuthModule {}
