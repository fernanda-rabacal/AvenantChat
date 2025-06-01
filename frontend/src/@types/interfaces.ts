export interface ICreateRoomDataProps {
  name: string;
  category: string;
  description?: string;
}

export interface IUser {
  id_user: number
  name: string
  email: string;
  avatar_url?: string
  is_online: boolean
  created_at: Date
}

export interface IChatRoom {
  id_chat_room: number;
  id_user: number;
  name: string;
  category: string;
  description?: string;
  last_activity: string;
  members_count?: number;
  created_at: Date;
  created_by_id: number;
}

export interface IChatMember {
  id_chat_room: number;
  id_user: number;
  id_chat_room_member: number;
  user?: IUser
}

export interface IChatMessage {
  id_message: number;
  id_chat_room_member: number;
  id_chat_room: number;
  content: string;
  sent_at: Date;
  edited_at?: Date;
  is_deleted?: boolean;
  user?: IUser
}

export interface ISendMessage {
  id_chat_room: number;
  id_user: number;
  content: string;
  user_name?: string;
}