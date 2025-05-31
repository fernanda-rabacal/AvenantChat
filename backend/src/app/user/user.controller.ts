import {
  Get,
  Post,
  Body,
  Param,
  Controller,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { Request } from 'express';
import { AuthTokenDto } from '../auth/dto/auth-token.dto';

@ApiTags('User')
@Controller('/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll() {
    return await this.userService.findAll();
  }

  @Get('/token')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: Request  & { user: AuthTokenDto }) {
    return await this.userService.findById(req.user.id_user);
  }

  @Get('/:id_user')
  async findById(@Param('id_user') id_user_user: string) {
    return await this.userService.findById(+id_user_user);
  }
 
  @Get('/chats/:id_user')
  findUserChats(@Param('id_user') id_user: number) {
    return this.userService.getUserRooms(+id_user);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Patch('/:id_user')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async update(@Param('id_user') id_user: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.update(+id_user, updateUserDto);
  }
}
