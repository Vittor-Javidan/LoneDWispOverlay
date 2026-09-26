import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('overlay', {
  getChatboxUrl: (): Promise<string> => ipcRenderer.invoke('overlay:get-chatbox-url'),
})