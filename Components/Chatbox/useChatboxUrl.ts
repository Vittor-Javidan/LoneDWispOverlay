import { useEffect } from 'react'

export function useChatboxUrl(o: {
  onUrlLoaded: (url: string) => void
}): void {
  useEffect(() => {
    let isMounted = true

    void window.overlay.getChatboxUrl().then((url) => {
      if (isMounted) o.onUrlLoaded(url)
    }).catch((error: unknown) => {
      console.error('Unable to load the chatbox URL:', error)
    })

    return () => {
      isMounted = false
    }
  }, [o.onUrlLoaded])
}