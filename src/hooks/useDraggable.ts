import { useRef, type PointerEvent } from 'react'

type DragPosition = {
  pointerId: number
  clientX: number
  clientY: number
  left: number
  top: number
}

export function useDraggable<T extends HTMLElement>() {
  const elementRef = useRef<T>(null)
  const dragPosition = useRef<DragPosition | null>(null)

  const onPointerDown = (event: PointerEvent<T>) => {
    if (event.button !== 0) return

    const target = event.target
    if (target instanceof Element && target.closest('button, input, select, textarea, a')) {
      return
    }

    const element = elementRef.current
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
  }

  const onPointerMove = (event: PointerEvent<T>) => {
    const start = dragPosition.current
    const element = elementRef.current
    if (!start || !element || start.pointerId !== event.pointerId) return

    element.style.left = `${start.left + event.clientX - start.clientX}px`
    element.style.top = `${start.top + event.clientY - start.clientY}px`
  }

  const onPointerUp = (event: PointerEvent<T>) => {
    if (dragPosition.current?.pointerId === event.pointerId) {
      dragPosition.current = null
    }
  }

  return {
    ref: elementRef,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
  }
}