export const getCorsOptions = (clientPort: number, clientURL: string) => {
  return  [
      `http://localhost:${clientPort}`,
      `http://localhost:${clientPort + 1}`,
      `http://localhost:${clientPort + 2}`,
      `http://localhost:${clientPort + 3}`,
      clientURL,
      new RegExp(`^http://192\\.168\\.1\\.([1-9]|[1-9]\\d):${clientPort}$`),
    ]
}