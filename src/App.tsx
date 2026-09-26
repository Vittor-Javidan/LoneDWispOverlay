import { useCallback, useRef, useState } from 'react'

import Camera from '../Components/Camera/Camera'
import Chatbox from '../Components/Chatbox/Chatbox'
import OverlayControls from '../Components/OverlayWindow/OverlayControls'
import {
  createDefaultOverlayPreferences,
  type CameraPreferences,
  type ChatboxPreferences,
  type OverlayPreferences,
} from '../Components/OverlayWindow/OverlayPreferences'
import { useOverlayClickThrough } from '../Components/OverlayWindow/useOverlayClickThrough'
import { useOverlayPreferences } from '../Components/OverlayWindow/useOverlayPreferences'

type OverlayPreferencesPatch = {
  isHoverHideEnabled?: boolean
  camera?: Partial<CameraPreferences>
  chatbox?: Partial<ChatboxPreferences>
}

export default function App() {
  const [isClickThrough, setIsClickThrough] = useState(false)
  const [preferences, setPreferences] = useState<OverlayPreferences | null>(null)
  const preferencesRef = useRef<OverlayPreferences | null>(null)

  const handlePreferencesLoaded = useCallback((loadedPreferences: OverlayPreferences) => {
    preferencesRef.current = loadedPreferences
    setPreferences(loadedPreferences)
  }, [])

  const { savePreferences } = useOverlayPreferences({
    onPreferencesLoaded: handlePreferencesLoaded,
  })

  const updatePreferences = useCallback((patch: OverlayPreferencesPatch) => {
    const current = preferencesRef.current
    if (!current) return

    const next: OverlayPreferences = {
      isHoverHideEnabled: patch.isHoverHideEnabled ?? current.isHoverHideEnabled,
      camera: { ...current.camera, ...patch.camera },
      chatbox: { ...current.chatbox, ...patch.chatbox },
    }

    preferencesRef.current = next
    setPreferences(next)
    savePreferences(next)
  }, [savePreferences])

  const updateCameraPreferences = useCallback((patch: Partial<CameraPreferences>) => {
    updatePreferences({ camera: patch })
  }, [updatePreferences])

  const updateChatboxPreferences = useCallback((patch: Partial<ChatboxPreferences>) => {
    updatePreferences({ chatbox: patch })
  }, [updatePreferences])

  const toggleHoverHide = useCallback(() => {
    const current = preferencesRef.current
    if (current) updatePreferences({ isHoverHideEnabled: !current.isHoverHideEnabled })
  }, [updatePreferences])

  const resetWidgets = useCallback(() => {
    updatePreferences(createDefaultOverlayPreferences())
  }, [updatePreferences])

  const makeClickThrough = useCallback(() => {
    setIsClickThrough(true)
    void window.overlay.setClickThrough(true).catch(() => setIsClickThrough(false))
  }, [])

  useOverlayClickThrough({ onClickThroughChanged: setIsClickThrough })

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
          onResetWidgets={resetWidgets}
        />
      )}
      <Chatbox
        preferences={preferences.chatbox}
        onPreferencesChanged={updateChatboxPreferences}
      />
      <Camera
        preferences={preferences.camera}
        onPreferencesChanged={updateCameraPreferences}
      />
    </main>
  )
}