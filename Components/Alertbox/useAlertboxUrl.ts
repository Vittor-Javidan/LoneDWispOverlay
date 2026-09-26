import { useEffect } from 'react'

export function useAlertboxUrl(o: {
  onUrlLoaded: (url: string) => void
}): void {
  useEffect(() => {
    let isMounted = true

    void window.overlay.getAlertboxUrl().then((url) => {
      if (isMounted) o.onUrlLoaded(url)
    }).catch((error: unknown) => {
      console.error('Unable to load the alertbox URL:', error)
    })

    return () => {
      isMounted = false
    }
  }, [o.onUrlLoaded])
}