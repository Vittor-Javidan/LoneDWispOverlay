import { app, BrowserWindow, globalShortcut, ipcMain, Menu, screen, Tray } from 'electron'
import { promises as fs } from 'node:fs'
import { dirname, join } from 'node:path'

import { Service_Server_Camera } from '../Camera/Service_Server'
import {
	createDefaultOverlayPreferences,
	normalizeOverlayPreferences,
} from './OverlayPreferences'

export class Service_Server_OverlayWindow {

  private static mainWindow: BrowserWindow | null = null
	private static isClickThrough = false
	private static isHoverHideEnabled = false
	private static preferences = createDefaultOverlayPreferences()
	private static preferencesFile = ''
	private static preferencesWriteQueue: Promise<void> = Promise.resolve()
	private static tray: Tray | null = null

	static async loadPreferences(): Promise<void> {
		this.preferencesFile = join(app.getPath('userData'), 'overlay-preferences.json')

		try {
			this.preferences = normalizeOverlayPreferences(
				JSON.parse(await fs.readFile(this.preferencesFile, 'utf8')) as unknown,
			)
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
				console.error('Could not load overlay preferences:', error)
			}
			this.preferences = createDefaultOverlayPreferences()
		}

		this.isHoverHideEnabled = this.preferences.isHoverHideEnabled
	}

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
		ipcMain.handle('overlay:get-preferences', () => this.preferences)
		ipcMain.handle('overlay:save-preferences', (_event, preferences: unknown) =>
			this.savePreferences(preferences),
		)
		const shortcut_RemoveIntangibility = globalShortcut.register('Control+Shift+Alt+O', () => {
			this.setClickThrough(false)
		})

		if (!shortcut_RemoveIntangibility) {
			console.warn('Could not register the Ctrl+Shift+Alt+O overlay shortcut')
		}
		const shortcut_ToggleVisibility = globalShortcut.register('Control+Shift+Alt+H', () => {
			const window = this.mainWindow
			if (!window || window.isDestroyed()) return

			window.webContents.send('overlay:toggle-widgets-visibility')
		})

		if (!shortcut_ToggleVisibility) {
			console.warn('Could not register the Ctrl+Shift+Alt+H widgets visibility shortcut')
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

	private static savePreferences(value: unknown): Promise<void> {
		const preferences = normalizeOverlayPreferences(value)
		const save = this.preferencesWriteQueue.then(async () => {
			await fs.mkdir(dirname(this.preferencesFile), { recursive: true })
			await fs.writeFile(this.preferencesFile, JSON.stringify(preferences, null, 2), 'utf8')

			this.preferences = preferences
			this.isHoverHideEnabled = preferences.isHoverHideEnabled
			this.updateIgnoreMouseEvents()
		})

		this.preferencesWriteQueue = save.catch(() => undefined)
		return save
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