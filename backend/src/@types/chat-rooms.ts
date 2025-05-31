export interface ChatProps {
  id_chat_room: number;
  id_user: number;
}

export interface MessageProps {
  id_chat_room_member: number;
  content: string;
  sent_at: Date;
  edited_at?: Date;
}

export interface SendMessageProps {
  id_chat_room: number;
  id_user: number;
  content: string;
  user_name?: string;
}