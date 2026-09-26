import { useCallback, useEffect, useRef, useState, type PointerEvent, type RefObject } from 'react'
import { Service_Browser_Camera, type ResizeCursor } from './Service_Browser'

type ResizeStart = {
  pointerId: number
  clientX: number
  clientY: number
  directionX: number
  directionY: number
  widgetLeft: number
  widgetTop: number
  size: number
}

const MINIMUM_SIZE = 50

export type CameraResizeValues = {
  size: number
  resizeCursor: ResizeCursor
  beginResize: (event: PointerEvent<HTMLDivElement>) => void
  handlePointerMove: (event: PointerEvent<HTMLDivElement>) => void
  finishResize: (event: PointerEvent<HTMLDivElement>) => void
}

export function useCameraResize(o: {
  widgetRef: RefObject<HTMLElement | null>
  resizeCallback: (values: CameraResizeValues) => void
}): void {

  const resizeStart = useRef<ResizeStart | null>(null)
  const [size, setSize] = useState(300)
  const [resizeCursor, setResizeCursor] = useState<ResizeCursor>('default')

  const beginResize = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return

    const widget = o.widgetRef.current
    if (!widget) return

    const resizeBounds = event.currentTarget.getBoundingClientRect()
    const resizeTarget = Service_Browser_Camera.getResizeTarget(
      event.clientX,
      event.clientY,
      resizeBounds,
    )

    if (!resizeTarget) {
      if (Service_Browser_Camera.isOutsideResizeArea(event.clientX, event.clientY, resizeBounds)) {
        event.stopPropagation()
      }
      return
    }

    const widgetBounds = widget.getBoundingClientRect()
    resizeStart.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      directionX: resizeTarget.directionX,
      directionY: resizeTarget.directionY,
      widgetLeft: widgetBounds.left,
      widgetTop: widgetBounds.top,
      size: resizeBounds.width,
    }

    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
  }, [o.widgetRef])

  const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const start = resizeStart.current
    if (!start) {
      const resizeTarget = Service_Browser_Camera.getResizeTarget(
        event.clientX,
        event.clientY,
        event.currentTarget.getBoundingClientRect(),
      )
      setResizeCursor(resizeTarget?.cursor ?? 'default')
      return
    }

    const widget = o.widgetRef.current
    if (!widget || start.pointerId !== event.pointerId) return

    const deltaX = event.clientX - start.clientX
    const deltaY = event.clientY - start.clientY
    const radialDelta = deltaX * start.directionX + deltaY * start.directionY
    const nextSize = Math.max(MINIMUM_SIZE, start.size + radialDelta)
    const offsetX = ((start.size - nextSize) * (1 - start.directionX)) / 2
    const offsetY = ((start.size - nextSize) * (1 - start.directionY)) / 2

    widget.style.left = `${start.widgetLeft + offsetX}px`
    widget.style.top = `${start.widgetTop + offsetY}px`

    setSize(nextSize)
  }, [o.widgetRef])

  const finishResize = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (resizeStart.current?.pointerId !== event.pointerId) return

    resizeStart.current = null
    const resizeTarget = Service_Browser_Camera.getResizeTarget(
      event.clientX,
      event.clientY,
      event.currentTarget.getBoundingClientRect(),
    )
    setResizeCursor(resizeTarget?.cursor ?? 'default')
  }, [])

  useEffect(() => {
    o.resizeCallback({
      size,
      resizeCursor,
      beginResize,
      handlePointerMove,
      finishResize,
    })
  }, [size, resizeCursor, beginResize, handlePointerMove, finishResize, o.resizeCallback])
}