import type { Message } from "@/@types/interfaces"

export function verifyShoudGroupMessage(message: Message, index: number, messages: Message[]) {
  const prevMessage = index > 0 ? messages[index - 1] : null
  const isLastMessage = messages.length - index === 1
  const shouldGroup =
    prevMessage &&
    prevMessage.user.id === message.user.id &&
    message.timestamp.getTime() - prevMessage.timestamp.getTime() < 5 * 60 * 1000 

  return { shouldGroup, isLastMessage }
}