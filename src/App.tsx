import { useCallback, useEffect, useRef, useState } from 'react'

import Alertbox from '../Components/Alertbox/Alertbox'
import Camera from '../Components/Camera/Camera'
import Chatbox from '../Components/Chatbox/Chatbox'
import OverlayControls from '../Components/OverlayWindow/OverlayControls'
import {
  createDefaultOverlayPreferences,
  type AlertboxPreferences,
  type CameraPreferences,
  type ChatboxPreferences,
  type OverlayPreferences,
} from '../Components/OverlayWindow/OverlayPreferences'
import { useOverlayClickThrough } from './hooks/useOverlayClickThrough'
import { useOverlayPreferences } from './hooks/useOverlayPreferences'

type OverlayPreferencesPatch = {
  isHoverHideEnabled?: boolean
  alertbox?: Partial<AlertboxPreferences>
  camera?: Partial<CameraPreferences>
  chatbox?: Partial<ChatboxPreferences>
}

export default function App() {

  const preferencesRef = useRef<OverlayPreferences | null>(null)
  const savePreferencesRef = useRef<((preferences: OverlayPreferences) => void) | null>(null)
  const [isClickThrough, setIsClickThrough] = useState(false)
  const [preferences   , setPreferences   ] = useState<OverlayPreferences | null>(null)

  const handlePreferencesLoaded = useCallback((loadedPreferences: OverlayPreferences) => {
    preferencesRef.current = loadedPreferences
    setPreferences(loadedPreferences)
  }, [])

  const handleSavePreferencesReady = useCallback((savePreferences: (preferences: OverlayPreferences) => void) => {
    savePreferencesRef.current = savePreferences
  }, [])

  const updatePreferences = useCallback((patch: OverlayPreferencesPatch) => {
    const current = preferencesRef.current
    if (!current) return

    const next: OverlayPreferences = {
      isHoverHideEnabled: patch.isHoverHideEnabled ?? current.isHoverHideEnabled,
      alertbox: { ...current.alertbox, ...patch.alertbox },
      camera: { ...current.camera, ...patch.camera },
      chatbox: { ...current.chatbox, ...patch.chatbox },
    }

    preferencesRef.current = next
    setPreferences(next)
    savePreferencesRef.current?.(next)
  }, [])

  const toggleHoverHide = useCallback(() => {
    const current = preferencesRef.current
    if (current) updatePreferences({ isHoverHideEnabled: !current.isHoverHideEnabled })
  }, [updatePreferences])

  const toggleWidgetsVisibility = useCallback(() => {
    const current = preferencesRef.current
    if (!current) return

    const areAllWidgetsHidden =
      current.alertbox.isHidden && current.camera.isHidden && current.chatbox.isHidden
    const shouldHideWidgets = !areAllWidgetsHidden

    updatePreferences({
      alertbox: { isHidden: shouldHideWidgets },
      camera: { isHidden: shouldHideWidgets },
      chatbox: { isHidden: shouldHideWidgets },
    })
  }, [updatePreferences])

  const makeClickThrough = useCallback(() => {
    setIsClickThrough(true)
    void window.overlay.setClickThrough(true).catch(() => setIsClickThrough(false))
  }, [])

  useEffect(
    () => window.overlay.onToggleWidgetsVisibility(toggleWidgetsVisibility),
    [toggleWidgetsVisibility],
  )

  useOverlayClickThrough({ onClickThroughChanged: setIsClickThrough })

  useOverlayPreferences({
    onPreferencesLoaded: handlePreferencesLoaded,
    onSavePreferencesReady: handleSavePreferencesReady,
  })

  if (!preferences) return null

  return (
    <main
      className={`overlay-root${isClickThrough ? ' is-click-through' : ''}${preferences.isHoverHideEnabled ? ' is-hover-hide-enabled' : ''}`}
    >
      {!isClickThrough && (
        <OverlayControls
          isHoverHideEnabled={preferences.isHoverHideEnabled}
          onToggleHoverHide={toggleHoverHide}
          onMakeClickThrough={makeClickThrough}
          onResetWidgets={() => updatePreferences(createDefaultOverlayPreferences())}
        />
      )}
      <Alertbox
        preferences={preferences.alertbox}
        onPreferencesChanged={(patch) => updatePreferences({ alertbox: patch })}
      />
      <Chatbox
        preferences={preferences.chatbox}
        onPreferencesChanged={(patch) => updatePreferences({ chatbox: patch })}
      />
      <Camera
        preferences={preferences.camera}
        onPreferencesChanged={(patch) => updatePreferences({ camera: patch })}
      />
    </main>
  )
}