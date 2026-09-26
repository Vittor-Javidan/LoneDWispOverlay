export type WidgetPosition = {
  left: number
  top: number
}

export type CameraPreferences = {
  position: WidgetPosition
  size: number
  isInverted: boolean
  isHidden: boolean
}

export type ChatboxPreferences = {
  position: WidgetPosition
  width: number
  height: number
  isHidden: boolean
  contentScalePercent: number
}

export type AlertboxPreferences = {
  position: WidgetPosition
  width: number
  height: number
  isHidden: boolean
}

export type OverlayPreferences = {
  isHoverHideEnabled: boolean
  alertbox: AlertboxPreferences
  camera: CameraPreferences
  chatbox: ChatboxPreferences
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function readNumber(value: unknown, fallback: number, minimum: number, maximum: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return Math.min(maximum, Math.max(minimum, value))
}

function normalizePosition(value: unknown, fallback: WidgetPosition): WidgetPosition {
  const position = asRecord(value)
  return {
    left: readNumber(position.left, fallback.left, -100_000, 100_000),
    top: readNumber(position.top, fallback.top, -100_000, 100_000),
  }
}

export function createDefaultOverlayPreferences(): OverlayPreferences {
  return {
    isHoverHideEnabled: false,
    camera: {
      position: { left: 0, top: 0 },
      size: 300,
      isInverted: true,
      isHidden: false,
    },
    chatbox: {
      position: { left: 0, top: 400 },
      width: 550,
      height: 250,
      isHidden: false,
      contentScalePercent: 100,
    },
    alertbox: {
      position: { left: 600, top: 0 },
      width: 550,
      height: 250,
      isHidden: false,
    },
  }
}

export function normalizeOverlayPreferences(value: unknown): OverlayPreferences {
  const source = asRecord(value)
  const defaults = createDefaultOverlayPreferences()
  const camera = asRecord(source.camera)
  const chatbox = asRecord(source.chatbox)
  const alertbox = asRecord(source.alertbox)
  const scale = readNumber(
    chatbox.contentScalePercent,
    defaults.chatbox.contentScalePercent,
    50,
    200,
  )

  return {
    isHoverHideEnabled: readBoolean(source.isHoverHideEnabled, defaults.isHoverHideEnabled),
    camera: {
      position: normalizePosition(camera.position, defaults.camera.position),
      size: readNumber(camera.size, defaults.camera.size, 50, 4096),
      isInverted: readBoolean(camera.isInverted, defaults.camera.isInverted),
      isHidden: readBoolean(camera.isHidden, defaults.camera.isHidden),
    },
    chatbox: {
      position: normalizePosition(chatbox.position, defaults.chatbox.position),
      width: readNumber(chatbox.width, defaults.chatbox.width, 250, 4096),
      height: readNumber(chatbox.height, defaults.chatbox.height, 120, 4096),
      isHidden: readBoolean(chatbox.isHidden, defaults.chatbox.isHidden),
      contentScalePercent: Math.min(200, Math.max(50, Math.round(scale / 10) * 10)),
    },
    alertbox: {
      position: normalizePosition(alertbox.position, defaults.alertbox.position),
      width: readNumber(alertbox.width, defaults.alertbox.width, 250, 4096),
      height: readNumber(alertbox.height, defaults.alertbox.height, 120, 4096),
      isHidden: readBoolean(alertbox.isHidden, defaults.alertbox.isHidden),
    },
  }
}