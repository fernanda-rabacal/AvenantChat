export const formatTimestamp = (date: Date) => {
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 24 && date.getDate() === now.getDate()) {
    return `Today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
  } else if (diffInHours < 48 && date.getDate() === now.getDate() - 1) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
  } else {
    return (
      date.toLocaleDateString([], { month: "short", day: "numeric" }) +
      ` at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    )
  }
}