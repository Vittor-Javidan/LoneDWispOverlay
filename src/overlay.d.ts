export {}

declare global {
  interface Window {
    overlay: {
      getChatboxUrl: () => Promise<string>
      setClickThrough: (isClickThrough: boolean) => Promise<void>
      getClickThrough: () => Promise<boolean>
      setHoverHideEnabled: (isEnabled: boolean) => Promise<void>
      getHoverHideEnabled: () => Promise<boolean>
      onClickThroughChanged: (callback: (isClickThrough: boolean) => void) => () => void
    }
  }
}