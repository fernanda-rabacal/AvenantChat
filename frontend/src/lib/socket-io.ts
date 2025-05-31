// socket-io.ts
import { parseCookies } from "nookies";
import { io, Socket } from "socket.io-client";

export const createSocketInstance = (userId: string | number): Socket => {
  const cookieName = `avenant_token_${userId}`;
  const { [cookieName]: token } = parseCookies();

  const savedActiveRoom = localStorage.getItem(`avenant_active_room_${userId}`);
  let room: { id_chat_room: number; name: string } = {} as {
    id_chat_room: number;
    name: string;
  };

  if (savedActiveRoom) {
    room = JSON.parse(savedActiveRoom);
  }

  return io("http://localhost:8080/chat-room", {
    autoConnect: false,
    withCredentials: true,
    transports: ["websocket"],
    auth: {
      token: `${token}`,
      room,
    },
  });
};