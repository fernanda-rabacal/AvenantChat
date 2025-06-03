import { User } from '@prisma/client';
import { Socket } from 'socket.io';

export type AuthPayload = User;

export type SocketWithAuth = Socket & {
  id_user?: number;
  name?: string;
  id_chat_room?: number
  user?: AuthPayload
}

export type RequestWithAuth = Request & AuthPayload;