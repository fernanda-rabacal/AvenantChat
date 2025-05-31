import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateChatRoomDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  category: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  created_by: number;
}
