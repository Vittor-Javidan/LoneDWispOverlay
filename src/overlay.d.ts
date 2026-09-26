export {}

declare global {
  interface Window {
    overlay: {
      getChatboxUrl: () => Promise<string>
    }
  }
}