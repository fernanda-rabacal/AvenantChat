import { Socket } from 'socket.io';

// guard types
export type AuthPayload = {
  userID: string;
  pollID: string;
  name: string;
};

export type SocketWithAuth = Socket & AuthPayload & {
  id_user?: number;
  name?: string;
  id_chat_room?: number
}

export type RequestWithAuth = Request & AuthPayload;