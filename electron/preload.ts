import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'

contextBridge.exposeInMainWorld('overlay', {
  getChatboxUrl: (): Promise<string> => ipcRenderer.invoke('overlay:get-chatbox-url'),
  setClickThrough: (isClickThrough: boolean): Promise<void> =>
    ipcRenderer.invoke('overlay:set-click-through', isClickThrough),
  getClickThrough: (): Promise<boolean> => ipcRenderer.invoke('overlay:get-click-through'),
  setHoverHideEnabled: (isEnabled: boolean): Promise<void> =>
    ipcRenderer.invoke('overlay:set-hover-hide-enabled', isEnabled),
  getHoverHideEnabled: (): Promise<boolean> => ipcRenderer.invoke('overlay:get-hover-hide-enabled'),
  onClickThroughChanged: (callback: (isClickThrough: boolean) => void): (() => void) => {
    const listener = (_event: IpcRendererEvent, isClickThrough: boolean): void => callback(isClickThrough)
    ipcRenderer.on('overlay:click-through-changed', listener)
    return () => {
      ipcRenderer.removeListener('overlay:click-through-changed', listener)
    }
  },
})