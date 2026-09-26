export type ResizeCursor = 'default' | 'ew-resize' | 'ns-resize' | 'nwse-resize' | 'nesw-resize'

export type ResizeTarget = {
  directionX: number
  directionY: number
  cursor: Exclude<ResizeCursor, 'default'>
}

const resizeHitArea = 12

export class Service_Browser_Camera {
  static getResizeTarget(clientX: number, clientY: number, bounds: DOMRect): ResizeTarget | null {
    const offsetX = clientX - (bounds.left + bounds.width / 2)
    const offsetY = clientY - (bounds.top + bounds.height / 2)
    const distance = Math.hypot(offsetX, offsetY)
    const radius = Math.min(bounds.width, bounds.height) / 2

    if (distance === 0 || Math.abs(distance - radius) > resizeHitArea) return null

    const directionX = offsetX / distance
    const directionY = offsetY / distance
    const cursor = Math.abs(directionX) > Math.abs(directionY) * 2
      ? 'ew-resize'
      : Math.abs(directionY) > Math.abs(directionX) * 2
        ? 'ns-resize'
        : directionX * directionY > 0
          ? 'nwse-resize'
          : 'nesw-resize'

    return { directionX, directionY, cursor }
  }

  static isOutsideResizeArea(clientX: number, clientY: number, bounds: DOMRect): boolean {
    const offsetX = clientX - (bounds.left + bounds.width / 2)
    const offsetY = clientY - (bounds.top + bounds.height / 2)
    const distance = Math.hypot(offsetX, offsetY)
    const radius = Math.min(bounds.width, bounds.height) / 2

    return distance > radius + resizeHitArea
  }
}