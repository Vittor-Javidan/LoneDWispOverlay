import { useCallback, useState } from 'react'

import Camera from '../Components/Camera/Camera'
import Chatbox from '../Components/Chatbox/Chatbox'
import OverlayControls from '../Components/OverlayWindow/OverlayControls'
import { useOverlayClickThrough } from '../Components/OverlayWindow/useOverlayClickThrough'
import { useOverlayHoverHide } from '../Components/OverlayWindow/useOverlayHoverHide'

export default function App() {

  const [isClickThrough    , setIsClickThrough    ] = useState(false)
  const [isHoverHideEnabled, setIsHoverHideEnabled] = useState(false)

  const makeClickThrough = useCallback(() => {
    setIsClickThrough(true)
    void window.overlay.setClickThrough(true).catch(() => setIsClickThrough(false))
  }, [])
  
  const toggleHoverHide = useCallback(() => {
    const nextEnabled = !isHoverHideEnabled
    setIsHoverHideEnabled(nextEnabled)
    void window.overlay.setHoverHideEnabled(nextEnabled).catch(() => {
      setIsHoverHideEnabled(!nextEnabled)
    })
  }, [isHoverHideEnabled])

  useOverlayClickThrough({ onClickThroughChanged: setIsClickThrough })
  useOverlayHoverHide({ onHoverHideEnabledChanged: setIsHoverHideEnabled })

  return (
    <main
      className={`overlay-root${isClickThrough ? ' is-click-through' : ''}${isHoverHideEnabled ? ' is-hover-hide-enabled' : ''}`}
    >
      {!isClickThrough && (
        <OverlayControls
          isHoverHideEnabled={isHoverHideEnabled}
          onToggleHoverHide={toggleHoverHide}
          onMakeClickThrough={makeClickThrough}
        />
      )}
      <Chatbox />
      <Camera />
    </main>
  )
}