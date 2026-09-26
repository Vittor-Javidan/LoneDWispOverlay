import { useCallback, useLayoutEffect, useRef, type PointerEvent, type RefObject } from 'react'
import type { WidgetPosition } from '../../Components/OverlayWindow/OverlayPreferences'

type DragPosition = {
  pointerId: number
  clientX: number
  clientY: number
  left: number
  top: number
}

export type DraggableHandlers<T extends HTMLElement> = {
  onPointerDown: (event: PointerEvent<T>) => void
  onPointerMove: (event: PointerEvent<T>) => void
  onPointerUp: (event: PointerEvent<T>) => void
  onPointerCancel: (event: PointerEvent<T>) => void
}

export function useDraggable<T extends HTMLElement>(o: {
  widgetRef: RefObject<T | null>
  position: WidgetPosition
  onPositionChange: (position: WidgetPosition) => void
  onDragHandlersChanged: (handlers: DraggableHandlers<T>) => void
}): void {
  const dragPosition = useRef<DragPosition | null>(null)

  useLayoutEffect(() => {
    const element = o.widgetRef.current
    if (!element) return

    element.style.left = `${o.position.left}px`
    element.style.top = `${o.position.top}px`
  }, [o.widgetRef, o.position.left, o.position.top])

  const onPointerDown = useCallback((event: PointerEvent<T>) => {
    if (event.button !== 0) return

    const target = event.target
    if (target instanceof Element && target.closest('button, input, select, textarea, a')) {
      return
    }

    const element = o.widgetRef.current
    if (!element) return

    const bounds = element.getBoundingClientRect()
    dragPosition.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      left: bounds.left,
      top: bounds.top,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    event.preventDefault()
  }, [o.widgetRef])

  const onPointerMove = useCallback((event: PointerEvent<T>) => {
    const start = dragPosition.current
    const element = o.widgetRef.current
    if (!start || !element || start.pointerId !== event.pointerId) return

    element.style.left = `${start.left + event.clientX - start.clientX}px`
    element.style.top = `${start.top + event.clientY - start.clientY}px`
  }, [o.widgetRef])

  const onPointerUp = useCallback((event: PointerEvent<T>) => {
    if (dragPosition.current?.pointerId !== event.pointerId) return

    const element = o.widgetRef.current
    if (element) {
      const bounds = element.getBoundingClientRect()
      o.onPositionChange({ left: bounds.left, top: bounds.top })
    }

    dragPosition.current = null
  }, [o.onPositionChange, o.widgetRef])

  useLayoutEffect(() => {
    o.onDragHandlersChanged({
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    })
  }, [o.onDragHandlersChanged, onPointerDown, onPointerMove, onPointerUp])
}