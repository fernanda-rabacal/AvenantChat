/*
  Warnings:

  - You are about to drop the column `chatRoomMemberId_chat_room_member` on the `chat_messages` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "chat_messages" DROP CONSTRAINT "chat_messages_chatRoomMemberId_chat_room_member_fkey";

-- AlterTable
ALTER TABLE "chat_messages" DROP COLUMN "chatRoomMemberId_chat_room_member";
