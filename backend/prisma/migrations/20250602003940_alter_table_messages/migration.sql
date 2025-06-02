/*
  Warnings:

  - You are about to drop the column `id_chat_room_member` on the `chat_messages` table. All the data in the column will be lost.
  - Added the required column `id_user` to the `chat_messages` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "chat_messages" DROP CONSTRAINT "chat_messages_id_chat_room_member_fkey";

-- DropIndex
DROP INDEX "chat_messages_id_chat_room_member_sent_at_idx";

-- AlterTable
ALTER TABLE "chat_messages" DROP COLUMN "id_chat_room_member",
ADD COLUMN     "chatRoomMemberId_chat_room_member" INTEGER,
ADD COLUMN     "id_user" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "chat_messages_id_user_sent_at_idx" ON "chat_messages"("id_user", "sent_at");

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_chatRoomMemberId_chat_room_member_fkey" FOREIGN KEY ("chatRoomMemberId_chat_room_member") REFERENCES "chat_room_members"("id_chat_room_member") ON DELETE SET NULL ON UPDATE CASCADE;
