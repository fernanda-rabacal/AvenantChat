import { Socket } from 'socket.io';

export interface SocketWithAuth extends Socket {
  id_user?: number;
  name?: string;
}
