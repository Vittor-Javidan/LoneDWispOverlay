import { useEffect, useRef, useState } from 'react'
import { useDraggable } from '../../src/hooks/useDraggable'
import './Camera.css'

const sizes = [150, 200, 250, 300, 350, 400, 450, 500]

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const dragHandlers = useDraggable<HTMLElement>()
  const [sizeIndex, setSizeIndex] = useState(3)
  const [isInverted, setIsInverted] = useState(true)
  const [isHidden, setIsHidden] = useState(false)
  const size = sizes[sizeIndex]

  useEffect(() => {
    let stream: MediaStream | null = null
    let isMounted = true

    const startCamera = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        console.warn('Camera access is not supported in this environment.')
        return
      }

      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 500, height: 500 },
        })

        if (!isMounted) {
          cameraStream.getTracks().forEach((track) => track.stop())
          return
        }

        stream = cameraStream
        if (videoRef.current) videoRef.current.srcObject = cameraStream
      } catch (error) {
        console.error('Unable to access the camera:', error)

        if (
          error instanceof DOMException &&
          ['NotReadableError', 'AbortError', 'TrackStartError'].includes(error.name)
        ) {
          window.alert(
            'A câmera não pôde ser iniciada. Ela pode estar em uso por outro aplicativo. ' +
              'Feche os outros aplicativos que usam a câmera e reinicie o overlay.',
          )
        }
      }
    }

    void startCamera()

    return () => {
      isMounted = false
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  return (
    <section className="widget camera-widget" {...dragHandlers} aria-label="Camera">
      <div
        className={`camera__frame${isInverted ? ' is-inverted' : ''}${isHidden ? ' is-hidden' : ''}`}
        style={{ width: size, height: size }}
      >
        <video
          ref={videoRef}
          className="camera__video"
          autoPlay
          playsInline
          style={{ width: size, height: size }}
          aria-label="Camera preview"
        />
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
        <div className="camera__control-row">
          <button
            className="camera__button camera__size-button"
            type="button"
            aria-label="Increase camera size"
            disabled={sizeIndex === sizes.length - 1}
            onClick={() => setSizeIndex((current) => Math.min(current + 1, sizes.length - 1))}
          >
            +
          </button>
          <button
            className="camera__button camera__size-button"
            type="button"
            aria-label="Decrease camera size"
            disabled={sizeIndex === 0}
            onClick={() => setSizeIndex((current) => Math.max(current - 1, 0))}
          >
            -
          </button>
        </div>
      </div>
    </section>
  )
}