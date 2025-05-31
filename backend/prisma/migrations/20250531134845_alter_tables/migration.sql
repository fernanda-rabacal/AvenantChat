-- CreateTable
CREATE TABLE "users" (
    "id_user" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "chat_rooms" (
    "id_chat_room" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" INTEGER NOT NULL,

    CONSTRAINT "chat_rooms_pkey" PRIMARY KEY ("id_chat_room")
);

-- CreateTable
CREATE TABLE "chat_room_members" (
    "id_chat_room_member" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_chat_room" INTEGER NOT NULL,

    CONSTRAINT "chat_room_members_pkey" PRIMARY KEY ("id_chat_room_member")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id_message" SERIAL NOT NULL,
    "content" VARCHAR NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "edited_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "id_chat_room_member" INTEGER NOT NULL,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id_message")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "chat_room_members_id_chat_room_idx" ON "chat_room_members"("id_chat_room");

-- CreateIndex
CREATE INDEX "chat_room_members_id_user_idx" ON "chat_room_members"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "chat_room_members_id_user_id_chat_room_key" ON "chat_room_members"("id_user", "id_chat_room");

-- CreateIndex
CREATE INDEX "chat_messages_id_chat_room_member_sent_at_idx" ON "chat_messages"("id_chat_room_member", "sent_at");

-- AddForeignKey
ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_room_members" ADD CONSTRAINT "chat_room_members_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_room_members" ADD CONSTRAINT "chat_room_members_id_chat_room_fkey" FOREIGN KEY ("id_chat_room") REFERENCES "chat_rooms"("id_chat_room") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_id_chat_room_member_fkey" FOREIGN KEY ("id_chat_room_member") REFERENCES "chat_room_members"("id_chat_room_member") ON DELETE RESTRICT ON UPDATE CASCADE;
