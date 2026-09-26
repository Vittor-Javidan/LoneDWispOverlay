import { useCallback, useRef, useState } from 'react'
import './Camera.css'

import { useDraggable, type DraggableHandlers } from '../../src/hooks/useDraggable'
import type { CameraPreferences, WidgetPosition } from '../OverlayWindow/OverlayPreferences'

import { useCameraResize, type CameraResizeValues } from './useCameraResize'
import { useCameraStream } from './useCameraStream'

export default function Camera(props: {
  preferences: CameraPreferences
  onPreferencesChanged: (patch: Partial<CameraPreferences>) => void
}) {

  const videoRef  = useRef<HTMLVideoElement>(null)
  const widgetRef = useRef<HTMLElement>(null)
  const [dragHandlers, setDragHandlers] = useState<DraggableHandlers<HTMLElement> | null>(null)
  const [resizeValues, setResizeValues] = useState<CameraResizeValues | null>(null)

  const handlePositionChange = useCallback((position: WidgetPosition) => {
    props.onPreferencesChanged({ position })
  }, [props.onPreferencesChanged])

  const handleResizeComplete = useCallback((values: {
    size: number
    position: WidgetPosition
  }) => {
    props.onPreferencesChanged({ size: values.size, position: values.position })
  }, [props.onPreferencesChanged])


  useCameraStream({ videoRef })

  useCameraResize({
    widgetRef,
    initialSize: props.preferences.size,
    resizeCallback: setResizeValues,
    onResizeComplete: handleResizeComplete,
  })

  useDraggable<HTMLElement>({
    widgetRef,
    position: props.preferences.position,
    onPositionChange: handlePositionChange,
    onDragHandlersChanged: setDragHandlers,
  })

  return (
    <section
      ref={widgetRef}
      className="widget camera-widget"
      onPointerDown={dragHandlers?.onPointerDown}
      onPointerMove={dragHandlers?.onPointerMove}
      onPointerUp={dragHandlers?.onPointerUp}
      onPointerCancel={dragHandlers?.onPointerCancel}
      aria-label="Camera"
    >
      <div
        className="camera__resize-area"
        style={{
          width: resizeValues?.size ?? props.preferences.size,
          height: resizeValues?.size ?? props.preferences.size,
          cursor: resizeValues?.resizeCursor ?? 'default',
        }}
        onPointerDown={resizeValues?.beginResize}
        onPointerMove={resizeValues?.handlePointerMove}
        onPointerUp={resizeValues?.finishResize}
        onPointerCancel={resizeValues?.finishResize}
      >
        <div
          className={`camera__frame${props.preferences.isInverted ? ' is-inverted' : ''}${props.preferences.isHidden ? ' is-hidden' : ''}`}
        >
          <video
            ref={videoRef}
            className="camera__video"
            autoPlay
            playsInline
            aria-label="Camera preview"
          />
        </div>
        <div className="camera__overlay" aria-hidden="true">Camera</div>
      </div>
      <div className="camera__controls">
        <div className="camera__control-row">
          <button
            className="camera__button"
            type="button"
            aria-pressed={props.preferences.isInverted}
            onClick={() => props.onPreferencesChanged({ isInverted: !props.preferences.isInverted })}
          >
            Invert
          </button>
          <button
            className="camera__button"
            type="button"
            aria-pressed={props.preferences.isHidden}
            onClick={() => props.onPreferencesChanged({ isHidden: !props.preferences.isHidden })}
          >
            {props.preferences.isHidden ? 'Show' : 'Hide'}
          </button>
        </div>
      </div>
    </section>
  )
}