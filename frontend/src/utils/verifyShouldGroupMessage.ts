import type { IChatMessage } from "@/@types/interfaces"
import dayjs from "dayjs";

export function verifyShoudGroupMessage(message: IChatMessage, index: number, messages: IChatMessage[]) {
  const prevMessage = index > 0 ? messages[index - 1] : null
  const isLastMessage = messages.length - index === 1

  const messageDate = dayjs(message.sent_at);
  const prevMessageDate = dayjs(prevMessage?.sent_at);
  const shouldGroup =
    !!prevMessage &&
    message.user?.name !== 'System' &&
    prevMessage.user?.id_user === message.user?.id_user &&
    messageDate.diff(prevMessageDate, 'minute') < 5;

  return { shouldGroup, isLastMessage }
}