import { app, dialog, type BrowserWindow } from 'electron'
import { promises as fs } from 'node:fs'
import { dirname, join } from 'node:path'

export class Service_Camera {

  private static cameraPermissionGranted = false
  private static cameraPermissionFile = ''
  private static cameraPermissionInitialized = false

  static async loadCameraPermission(): Promise<void> {
    this.cameraPermissionFile = join(app.getPath('userData'), 'camera-permission.json')

    try {
      const savedPermissions = JSON.parse(
        await fs.readFile(this.cameraPermissionFile, 'utf8'),
      ) as { camera?: boolean }
      this.cameraPermissionGranted = savedPermissions.camera === true
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error('Could not load camera permission:', error)
      }
    }

    this.cameraPermissionInitialized = true
  }

  static isCameraPermissionInitialized(): boolean {
    return this.cameraPermissionInitialized
  }

  static registerCameraPermissionHandler(window: BrowserWindow): void {
    window.webContents.session.setPermissionRequestHandler(
      (webContents, permission, callback, details) => {
        const isCameraRequest =
          webContents === window.webContents &&
          permission === 'media' &&
          'mediaTypes' in details &&
          details.mediaTypes?.includes('video') === true

        if (!isCameraRequest) {
          callback(false)
          return
        }

        if (this.cameraPermissionGranted) {
          callback(true)
          return
        }

        void dialog.showMessageBox(window, {
          type: 'question',
          title: 'Acesso à câmera',
          message: 'Permitir que o LoneDWisp Overlay acesse sua câmera?',
          detail: 'O vídeo da câmera será exibido no overlay.',
          buttons: ['Permitir', 'Bloquear'],
          defaultId: 0,
          cancelId: 1,
        }).then(async ({ response }) => {
          this.cameraPermissionGranted = response === 0

          if (this.cameraPermissionGranted) {
            try {
              await fs.mkdir(dirname(this.cameraPermissionFile), { recursive: true })
              await fs.writeFile(
                this.cameraPermissionFile,
                JSON.stringify({ camera: true }),
                'utf8',
              )
            } catch (error) {
              console.error('Could not save camera permission:', error)
            }
          }

          callback(this.cameraPermissionGranted)
        }).catch(() => callback(false))
      },
    )
  }
}