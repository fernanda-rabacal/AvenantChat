-- DropForeignKey
ALTER TABLE "chat_messages" DROP CONSTRAINT "chat_messages_id_chat_room_fkey";

-- DropForeignKey
ALTER TABLE "chat_room_members" DROP CONSTRAINT "chat_room_members_id_chat_room_fkey";

-- AddForeignKey
ALTER TABLE "chat_room_members" ADD CONSTRAINT "chat_room_members_id_chat_room_fkey" FOREIGN KEY ("id_chat_room") REFERENCES "chat_rooms"("id_chat_room") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_id_chat_room_fkey" FOREIGN KEY ("id_chat_room") REFERENCES "chat_rooms"("id_chat_room") ON DELETE CASCADE ON UPDATE CASCADE;
