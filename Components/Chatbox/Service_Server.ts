import { app, ipcMain } from 'electron'
import { join } from 'node:path'

export class Service_Server_Chatbox {

  static registerChatboxIpcHandler(): void {

    process.loadEnvFile(join(app.getAppPath(), '.env'))

    const chatboxUrl = process.env.ENV_URL_CHATBOX_STREAMLABS

    if (!chatboxUrl) {
      throw new Error('ENV_URL_CHATBOX_STREAMLABS must be set in .env')
    }

    ipcMain.handle('overlay:get-chatbox-url', () => chatboxUrl)
  }
}