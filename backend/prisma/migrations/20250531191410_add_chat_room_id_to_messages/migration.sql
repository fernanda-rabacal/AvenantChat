/*
  Warnings:

  - Added the required column `id_chat_room` to the `chat_messages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "chat_messages" ADD COLUMN     "id_chat_room" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_id_chat_room_fkey" FOREIGN KEY ("id_chat_room") REFERENCES "chat_rooms"("id_chat_room") ON DELETE RESTRICT ON UPDATE CASCADE;
