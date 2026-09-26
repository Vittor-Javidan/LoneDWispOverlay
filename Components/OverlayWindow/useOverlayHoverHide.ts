import { useEffect } from 'react'

export function useOverlayHoverHide({
  onHoverHideEnabledChanged,
}: {
  onHoverHideEnabledChanged: (isEnabled: boolean) => void
}): void {
  useEffect(() => {
    let isMounted = true

    void window.overlay.getHoverHideEnabled().then((isEnabled) => {
      if (isMounted) onHoverHideEnabledChanged(isEnabled)
    })

    return () => {
      isMounted = false
    }
  }, [onHoverHideEnabledChanged])
}