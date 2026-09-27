import { useEffect, useRef, type RefObject } from 'react'

export function useCameraVisibility(o: {
  frameRef: RefObject<HTMLDivElement | null>
  isHidden: boolean
  onCameraEnabledChanged: (isEnabled: boolean) => void
}): void {

  const previousIsHiddenRef = useRef(o.isHidden)
  const stopTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    const wasHidden = previousIsHiddenRef.current
    previousIsHiddenRef.current = o.isHidden
    const frame = o.frameRef.current

    const clearStopTimeout = () => {
      if (stopTimeoutRef.current === null) return
      window.clearTimeout(stopTimeoutRef.current)
      stopTimeoutRef.current = null
    }

    if (!o.isHidden) {
      clearStopTimeout()
      o.onCameraEnabledChanged(true)
      return
    }

    if (wasHidden) {
      o.onCameraEnabledChanged(false)
      return
    }

    const stopCamera = () => {
      clearStopTimeout()
      frame?.removeEventListener('transitionend', handleTransitionEnd)
      o.onCameraEnabledChanged(false)
    }

    const handleTransitionEnd = (event: TransitionEvent) => {
      if (event.propertyName !== 'opacity') return
      stopCamera()
    }

    frame?.addEventListener('transitionend', handleTransitionEnd)
    stopTimeoutRef.current = window.setTimeout(stopCamera, 600)

    return () => {
      frame?.removeEventListener('transitionend', handleTransitionEnd)
      clearStopTimeout()
    }
  }, [o.frameRef, o.isHidden, o.onCameraEnabledChanged])
}