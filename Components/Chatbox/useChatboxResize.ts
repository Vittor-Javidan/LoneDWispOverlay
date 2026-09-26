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

export type ChatboxResizeValues = {
  frameSize: FrameSize
  beginResize: (event: PointerEvent<HTMLDivElement>, direction: ResizeDirection) => void
  handlePointerMove: (event: PointerEvent<HTMLDivElement>) => void
  finishResize: (event: PointerEvent<HTMLDivElement>) => void
}

export function useChatboxResize(o: {
  widgetRef: RefObject<HTMLElement | null>
  resizeCallback: (values: ChatboxResizeValues) => void
}): void {
  const resizeStart = useRef<ResizeStart | null>(null)
  const [frameSize, setFrameSize] = useState({ width: 550, height: 250 })

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

    if (start.direction.includes('left')) {
      widget.style.left = `${start.widgetLeft + start.width - width}px`
    }
    if (start.direction.includes('top')) {
      widget.style.top = `${start.widgetTop + start.height - height}px`
    }

    setFrameSize({ width, height })
  }, [o.widgetRef])

  const finishResize = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (resizeStart.current?.pointerId === event.pointerId) {
      resizeStart.current = null
    }
  }, [])

  useEffect(() => {
    o.resizeCallback({
      frameSize,
      beginResize,
      handlePointerMove,
      finishResize,
    })
  }, [frameSize, beginResize, handlePointerMove, finishResize, o.resizeCallback])
}