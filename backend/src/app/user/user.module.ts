import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../../db/prisma.service';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { UserRepository } from './repositories/user.repository';

@Module({
  imports: [JwtModule],
  controllers: [UserController],
  providers: [UserService, PrismaService, JwtStrategy, UserRepository],
  exports: [UserService]
})
export class UserModule {}
