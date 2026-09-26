import { BrowserWindow, screen } from 'electron'
import { join } from 'node:path'

import { Service_Camera } from '../Camera/Service'

export class Service_OverlayWindow {

  private static mainWindow: BrowserWindow | null = null

	static async createWindow(): Promise<void> {
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

		this.mainWindow = window
		Service_Camera.registerCameraPermissionHandler(window)

		const rendererUrl = process.env.ELECTRON_RENDERER_URL
		if (rendererUrl) {
			await window.loadURL(rendererUrl)
		} else {
			await window.loadFile(join(__dirname, '../renderer/index.html'))
		}

		window.on('closed', () => {
			if (this.mainWindow === window) this.mainWindow = null
		})
	}

	static hasWindow(): boolean {
		return this.mainWindow !== null
	}
}