import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import type { OverlayPreferences } from '../Components/OverlayWindow/OverlayPreferences'

contextBridge.exposeInMainWorld('overlay', {
  getChatboxUrl: (): Promise<string> => ipcRenderer.invoke('overlay:get-chatbox-url'),
  getPreferences: (): Promise<OverlayPreferences> => ipcRenderer.invoke('overlay:get-preferences'),
  savePreferences: (preferences: OverlayPreferences): Promise<void> =>
    ipcRenderer.invoke('overlay:save-preferences', preferences),
  setClickThrough: (isClickThrough: boolean): Promise<void> =>
    ipcRenderer.invoke('overlay:set-click-through', isClickThrough),
  getClickThrough: (): Promise<boolean> => ipcRenderer.invoke('overlay:get-click-through'),
  onClickThroughChanged: (callback: (isClickThrough: boolean) => void): (() => void) => {
    const listener = (_event: IpcRendererEvent, isClickThrough: boolean): void => callback(isClickThrough)
    ipcRenderer.on('overlay:click-through-changed', listener)
    return () => {
      ipcRenderer.removeListener('overlay:click-through-changed', listener)
    }
  },
})