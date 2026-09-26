import { app, ipcMain } from 'electron'
import { join } from 'node:path'

export class Service_Server_Alertbox {

  static registerAlertboxIpcHandler(): void {

    process.loadEnvFile(join(app.getAppPath(), '.env'))

    const alertboxUrl = process.env.ENV_URL_ALERTBOX_STREAMLABS

    if (!alertboxUrl) {
      throw new Error('ENV_URL_ALERTBOX_STREAMLABS must be set in .env')
    }

    ipcMain.handle('overlay:get-alertbox-url', () => alertboxUrl)
  }
}
