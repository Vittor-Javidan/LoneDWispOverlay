import { useCallback, useEffect, useRef, useState, type PointerEvent, type RefObject } from 'react'

export const resizeDirections = [
  'top',
  'top-right',
  'right',
  'bottom-right',
  'bottom',
  'bottom-left',
  'left',
  'top-left',
] as const

type ResizeDirection = (typeof resizeDirections)[number]

type ResizeStart = {
  pointerId: number
  direction: ResizeDirection
  clientX: number
  clientY: number
  widgetLeft: number
  widgetTop: number
  width: number
  height: number
}

type FrameSize = {
  width: number
  height: number
}

const MINIMUM_WIDTH = 250
const MINIMUM_HEIGHT = 120

export type WidgetResizeValues = {
  frameSize: FrameSize
  beginResize: (event: PointerEvent<HTMLDivElement>, direction: ResizeDirection) => void
  handlePointerMove: (event: PointerEvent<HTMLDivElement>) => void
  finishResize: (event: PointerEvent<HTMLDivElement>) => void
}

export function useWidgetResize(o: {
  widgetRef: RefObject<HTMLElement | null>
  initialFrameSize: FrameSize
  resizeCallback: (values: WidgetResizeValues) => void
  onResizeComplete: (values: { width: number; height: number; position: { left: number; top: number } }) => void
}): void {
  const resizeStart = useRef<ResizeStart | null>(null)
  const [frameSize, setFrameSize] = useState(o.initialFrameSize)

  useEffect(() => {
    setFrameSize(o.initialFrameSize)
  }, [o.initialFrameSize.width, o.initialFrameSize.height])

  const beginResize = useCallback((event: PointerEvent<HTMLDivElement>, direction: ResizeDirection) => {
    if (event.button !== 0) return

    const widget = o.widgetRef.current
    const reference = event.currentTarget.parentElement
    if (!widget || !reference) return

    const widgetBounds = widget.getBoundingClientRect()
    const referenceBounds = reference.getBoundingClientRect()
    resizeStart.current = {
      pointerId: event.pointerId,
      direction,
      clientX: event.clientX,
      clientY: event.clientY,
      widgetLeft: widgetBounds.left,
      widgetTop: widgetBounds.top,
      width: referenceBounds.width,
      height: referenceBounds.height,
    }

    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
  }, [o.widgetRef])

  const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const start = resizeStart.current
    const widget = o.widgetRef.current
    if (!start || !widget || start.pointerId !== event.pointerId) return

    const deltaX = event.clientX - start.clientX
    const deltaY = event.clientY - start.clientY
    const width = Math.max(
      MINIMUM_WIDTH,
      start.width + (start.direction.includes('left') ? -deltaX : start.direction.includes('right') ? deltaX : 0),
    )
    const height = Math.max(
      MINIMUM_HEIGHT,
      start.height + (start.direction.includes('top') ? -deltaY : start.direction.includes('bottom') ? deltaY : 0),
    )
    const nextLeft = start.direction.includes('left')
      ? start.widgetLeft + start.width - width
      : start.widgetLeft
    const nextTop = start.direction.includes('top')
      ? start.widgetTop + start.height - height
      : start.widgetTop

    widget.style.left = `${nextLeft}px`
    widget.style.top = `${nextTop}px`

    setFrameSize({ width, height })
  }, [o.widgetRef])

  const finishResize = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (resizeStart.current?.pointerId !== event.pointerId) return
    resizeStart.current = null

    const widget = o.widgetRef.current
    if (!widget) return

    const bounds = widget.getBoundingClientRect()
    const frame = widget.firstElementChild?.getBoundingClientRect()
    o.onResizeComplete({
      width: frame?.width ?? frameSize.width,
      height: frame?.height ?? frameSize.height,
      position: { left: bounds.left, top: bounds.top },
    })
  }, [frameSize, o.onResizeComplete, o.widgetRef])

  useEffect(() => {
    o.resizeCallback({
      frameSize,
      beginResize,
      handlePointerMove,
      finishResize,
    })
  }, [frameSize, beginResize, handlePointerMove, finishResize, o.resizeCallback])
}