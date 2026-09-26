import { useCallback, useEffect } from 'react'
import { createDefaultOverlayPreferences, type OverlayPreferences } from './OverlayPreferences'

export function useOverlayPreferences(o: {
  onPreferencesLoaded: (preferences: OverlayPreferences) => void
}): {
  savePreferences: (preferences: OverlayPreferences) => void
} {
  useEffect(() => {
    let isMounted = true

    void window.overlay.getPreferences().then((preferences) => {
      if (isMounted) o.onPreferencesLoaded(preferences)
    }).catch((error: unknown) => {
      console.error('Could not load overlay preferences:', error)
      if (isMounted) o.onPreferencesLoaded(createDefaultOverlayPreferences())
    })

    return () => {
      isMounted = false
    }
  }, [o.onPreferencesLoaded])

  const savePreferences = useCallback((preferences: OverlayPreferences) => {
    void window.overlay.savePreferences(preferences).catch((error: unknown) => {
      console.error('Could not save overlay preferences:', error)
    })
  }, [])

  return { savePreferences }
}