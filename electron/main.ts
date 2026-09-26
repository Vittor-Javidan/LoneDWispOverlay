import { app, BrowserWindow, dialog, ipcMain, screen } from 'electron'
import { promises as fs } from 'node:fs'
import { dirname, join } from 'node:path'

let mainWindow: BrowserWindow | null = null
let cameraPermissionGranted = false
let cameraPermissionFile = ''

async function createWindow(): Promise<void> {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  const window = new BrowserWindow({
    width,
    height,
    frame: false,
    transparent: true,
    title: 'LoneDWisp Overlay',
    webPreferences: {
      backgroundThrottling: false,
      contextIsolation: true,
      nodeIntegration: false,
      preload: join(__dirname, '../preload/index.js'),
    },
  })

  mainWindow = window
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

      if (cameraPermissionGranted) {
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
        cameraPermissionGranted = response === 0

        if (cameraPermissionGranted) {
          try {
            await fs.mkdir(dirname(cameraPermissionFile), { recursive: true })
            await fs.writeFile(
              cameraPermissionFile,
              JSON.stringify({ camera: true }),
              'utf8',
            )
          } catch (error) {
            console.error('Could not save camera permission:', error)
          }
        }

        callback(cameraPermissionGranted)
      }).catch(() => callback(false))
    },
  )

  const rendererUrl = process.env.ELECTRON_RENDERER_URL
  if (rendererUrl) {
    await window.loadURL(rendererUrl)
  } else {
    await window.loadFile(join(__dirname, '../renderer/index.html'))
  }

  window.on('closed', () => {
    if (mainWindow === window) mainWindow = null
  })
}

app.whenReady().then(async () => {
  process.loadEnvFile(join(app.getAppPath(), '.env'))
  const chatboxUrl = process.env.ENV_URL_CHATBOX_STREAMLABS

  if (!chatboxUrl) {
    throw new Error('ENV_URL_CHATBOX_STREAMLABS must be set in .env')
  }

  ipcMain.handle('overlay:get-chatbox-url', () => chatboxUrl)
  cameraPermissionFile = join(app.getPath('userData'), 'camera-permission.json')

  try {
    const savedPermissions = JSON.parse(
      await fs.readFile(cameraPermissionFile, 'utf8'),
    ) as { camera?: boolean }
    cameraPermissionGranted = savedPermissions.camera === true
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error('Could not load camera permission:', error)
    }
  }

  await createWindow()
})

app.on('activate', () => {
  if (!mainWindow && cameraPermissionFile) void createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})