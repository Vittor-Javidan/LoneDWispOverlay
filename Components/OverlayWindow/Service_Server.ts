import { app, BrowserWindow, globalShortcut, ipcMain, Menu, screen, Tray } from 'electron'
import { join } from 'node:path'

import { Service_Server_Camera } from '../Camera/Service_Server'

export class Service_Server_OverlayWindow {

  private static mainWindow: BrowserWindow | null = null
	private static isClickThrough = false
	private static isHoverHideEnabled = false
	private static tray: Tray | null = null

	static async registerIntangibilityControls(): Promise<void> {

		if (this.tray) return

		const trayIcon = await app.getFileIcon(process.execPath, { size: 'small' })
		this.tray = new Tray(trayIcon)
		this.tray.setToolTip('LoneDWisp Overlay')
		this.tray.setContextMenu(Menu.buildFromTemplate([
			{
				label: 'Tornar overlay tangível novamente',
				click: () => this.setClickThrough(false),
			},
			{ type: 'separator' },
			{ label: 'Sair', click: () => app.quit() },
		]))

		ipcMain.handle('overlay:set-click-through', (_event, isClickThrough: boolean) => {
			if (typeof isClickThrough !== 'boolean') {
				throw new TypeError('isClickThrough must be a boolean')
			}

			this.setClickThrough(isClickThrough)
		})
		ipcMain.handle('overlay:get-click-through', () => this.isClickThrough)
		ipcMain.handle('overlay:set-hover-hide-enabled', (_event, isEnabled: boolean) => {
			if (typeof isEnabled !== 'boolean') {
				throw new TypeError('isEnabled must be a boolean')
			}

			this.setHoverHideEnabled(isEnabled)
		})
		ipcMain.handle('overlay:get-hover-hide-enabled', () => this.isHoverHideEnabled)

		const shortcutRegistered = globalShortcut.register('Control+Shift+Alt+O', () => {
			this.setClickThrough(false)
		})

		if (!shortcutRegistered) {
			console.warn('Could not register the Ctrl+Shift+Alt+O overlay shortcut')
		}
	}

	static async createWindow(): Promise<void> {
		const { width, height } = screen.getPrimaryDisplay().workAreaSize
		const window = new BrowserWindow({
			width,
			height,
			frame: false,
			transparent: true,
			focusable: false,
			show: false,
			title: 'LoneDWisp Overlay',
			webPreferences: {
				backgroundThrottling: false,
				contextIsolation: true,
				nodeIntegration: false,
				preload: join(__dirname, '../preload/index.js'),
			},
		})

		this.mainWindow = window
		window.setAlwaysOnTop(true)
		window.setIgnoreMouseEvents(this.isClickThrough, {
			forward: this.isClickThrough && this.isHoverHideEnabled,
		})
		Service_Server_Camera.registerCameraPermissionHandler(window)

		const rendererUrl = process.env.ELECTRON_RENDERER_URL
		if (rendererUrl) {
			await window.loadURL(rendererUrl)
		} else {
			await window.loadFile(join(__dirname, '../renderer/index.html'))
		}
		window.showInactive()

		window.on('closed', () => {
			if (this.mainWindow === window) this.mainWindow = null
		})
	}

	private static setClickThrough(isClickThrough: boolean): void {
		this.isClickThrough = isClickThrough
		const window = this.mainWindow
		if (!window || window.isDestroyed()) return

		this.updateIgnoreMouseEvents()
		window.webContents.send('overlay:click-through-changed', isClickThrough)
	}

	private static setHoverHideEnabled(isEnabled: boolean): void {
		this.isHoverHideEnabled = isEnabled
		this.updateIgnoreMouseEvents()
	}

	private static updateIgnoreMouseEvents(): void {
		const window = this.mainWindow
		if (!window || window.isDestroyed()) return

		window.setIgnoreMouseEvents(this.isClickThrough, {
			forward: this.isClickThrough && this.isHoverHideEnabled,
		})
	}

	static hasWindow(): boolean {
		return this.mainWindow !== null
	}
}