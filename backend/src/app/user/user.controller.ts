import {
  Get,
  Post,
  Body,
  Param,
  Controller,
  Patch,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { AuthTokenDto } from '../auth/dto/auth-token.dto';

@ApiTags('User')
@Controller('/users')
export class UserController {
  constructor(private readonly userService: UserService) {}
   private readonly logger = new Logger(UserController.name);

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    try {
      return await this.userService.findAll();
    } catch (err) {
      this.logger.error(err);

      throw err;
    }
  }

  @Post()
  async create(@Body() create_user_dto: CreateUserDto) {
    try {
      return this.userService.create(create_user_dto);
    } catch (err) {
      this.logger.error(err);

      throw err;
    }
  }

  @Get('/token')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: Request  & { user: AuthTokenDto }) {
    try {
      return await this.userService.findById(req.user.id_user);
    } catch (err) {
      this.logger.error(err);

      throw err;
    }
  }

  @Get('/:id_user')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async findById(@Param('id_user') id_user: string) {
    try {
      return await this.userService.findById(+id_user);
    } catch (err) {
      this.logger.error(err);

      throw err;
    }
  }
 
  @Get('/chats/:id_user')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  findUserChats(@Param('id_user') id_user: number) {
    try {
      return this.userService.getUserRooms(+id_user);
    } catch (err) {
      this.logger.error(err);

      throw err;
    }
  }

  @Patch('/:id_user')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async update(@Param('id_user') id_user: string, @Body() update_user_dto: UpdateUserDto) {
    try {
      return await this.userService.update(+id_user, update_user_dto);
    } catch (err) {
      this.logger.error(err);

      throw err;
    }
  }
}
