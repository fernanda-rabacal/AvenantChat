import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateConnectionStateDto {
  @ApiProperty()
  @IsIn(['connected', 'disconnected'], {
    message: 'Connection state must be either "connected" or "disconnected"',
  })
  connection_state: 'connected' | 'disconnected';
} 