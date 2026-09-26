import { useCallback, useEffect } from 'react'
import { createDefaultOverlayPreferences, type OverlayPreferences } from '../../Components/OverlayWindow/OverlayPreferences'

export function useOverlayPreferences(o: {
  onPreferencesLoaded: (preferences: OverlayPreferences) => void
  onSavePreferencesReady: (savePreferences: (preferences: OverlayPreferences) => void) => void
}): void {
  const savePreferences = useCallback((preferences: OverlayPreferences) => {
    void window.overlay.savePreferences(preferences).catch((error: unknown) => {
      console.error('Could not save overlay preferences:', error)
    })
  }, [])

  useEffect(() => {
    o.onSavePreferencesReady(savePreferences)
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
  }, [o.onPreferencesLoaded, o.onSavePreferencesReady, savePreferences])
}