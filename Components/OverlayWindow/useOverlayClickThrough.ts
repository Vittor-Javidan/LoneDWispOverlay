import { useEffect } from 'react'

export function useOverlayClickThrough(o: {
  onClickThroughChanged: (isClickThrough: boolean) => void
}): void {
  useEffect(() => {

    let isMounted = true
    const handleClickThroughChanged = (isClickThrough: boolean): void => {
      if (isMounted) o.onClickThroughChanged(isClickThrough)
    }
    const unsubscribe = window.overlay.onClickThroughChanged(handleClickThroughChanged)

    void window.overlay.getClickThrough().then(handleClickThroughChanged)

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [o.onClickThroughChanged])
}