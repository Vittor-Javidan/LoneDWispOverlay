import type { OverlayPreferences } from '../Components/OverlayWindow/OverlayPreferences'

export {}

declare global {
  interface Window {
    overlay: {
      getChatboxUrl: () => Promise<string>
      getAlertboxUrl: () => Promise<string>
      getPreferences: () => Promise<OverlayPreferences>
      savePreferences: (preferences: OverlayPreferences) => Promise<void>
      setClickThrough: (isClickThrough: boolean) => Promise<void>
      getClickThrough: () => Promise<boolean>
      onClickThroughChanged: (callback: (isClickThrough: boolean) => void) => () => void
      onToggleWidgetsVisibility: (callback: () => void) => () => void
    }
  }
}