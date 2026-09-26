import { useRef, useState } from 'react'
import './Camera.css'

import { useDraggable } from '../../src/hooks/useDraggable'

import { useCameraResize, type CameraResizeValues } from './useCameraResize'
import { useCameraStream } from './useCameraStream'

export default function Camera() {

  const videoRef     = useRef<HTMLVideoElement>(null)
  const dragHandlers = useDraggable<HTMLElement>()

  const [resizeValues, setResizeValues] = useState<CameraResizeValues | null>(null)
  const [isInverted  , setIsInverted  ] = useState(true)
  const [isHidden    , setIsHidden    ] = useState(false)

  useCameraStream({ videoRef })

  useCameraResize({
    widgetRef: dragHandlers.ref,
    resizeCallback: setResizeValues,
  })


  return (
    <section className="widget camera-widget" {...dragHandlers} aria-label="Camera">
      <div
        className="camera__resize-area"
        style={{
          width: resizeValues?.size ?? 300,
          height: resizeValues?.size ?? 300,
          cursor: resizeValues?.resizeCursor ?? 'default',
        }}
        onPointerDown={resizeValues?.beginResize}
        onPointerMove={resizeValues?.handlePointerMove}
        onPointerUp={resizeValues?.finishResize}
        onPointerCancel={resizeValues?.finishResize}
      >
        <div
          className={`camera__frame${isInverted ? ' is-inverted' : ''}${isHidden ? ' is-hidden' : ''}`}
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
            aria-pressed={isInverted}
            onClick={() => setIsInverted((current) => !current)}
          >
            Invert
          </button>
          <button
            className="camera__button"
            type="button"
            aria-pressed={isHidden}
            onClick={() => setIsHidden((current) => !current)}
          >
            {isHidden ? 'Show' : 'Hide'}
          </button>
        </div>
      </div>
    </section>
  )
}