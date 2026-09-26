import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { useDraggable } from '../../src/hooks/useDraggable'
import './Camera.css'

type ResizeCursor = 'default' | 'ew-resize' | 'ns-resize' | 'nwse-resize' | 'nesw-resize'

type ResizeTarget = {
  directionX: number
  directionY: number
  cursor: Exclude<ResizeCursor, 'default'>
}

type ResizeStart = {
  pointerId: number
  clientX: number
  clientY: number
  directionX: number
  directionY: number
  widgetLeft: number
  widgetTop: number
  size: number
}

const resizeHitArea = 12
const minimumSize = 50

const getResizeTarget = (clientX: number, clientY: number, bounds: DOMRect): ResizeTarget | null => {
  const offsetX = clientX - (bounds.left + bounds.width / 2)
  const offsetY = clientY - (bounds.top + bounds.height / 2)
  const distance = Math.hypot(offsetX, offsetY)
  const radius = Math.min(bounds.width, bounds.height) / 2

  if (distance === 0 || Math.abs(distance - radius) > resizeHitArea) return null

  const directionX = offsetX / distance
  const directionY = offsetY / distance
  const cursor = Math.abs(directionX) > Math.abs(directionY) * 2
    ? 'ew-resize'
    : Math.abs(directionY) > Math.abs(directionX) * 2
      ? 'ns-resize'
      : directionX * directionY > 0
        ? 'nwse-resize'
        : 'nesw-resize'

  return { directionX, directionY, cursor }
}

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const dragHandlers = useDraggable<HTMLElement>()
  const resizeStart = useRef<ResizeStart | null>(null)
  const [size, setSize] = useState(300)
  const [resizeCursor, setResizeCursor] = useState<ResizeCursor>('default')
  const [isInverted, setIsInverted] = useState(true)
  const [isHidden, setIsHidden] = useState(false)

  const beginResize = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return

    const widget = dragHandlers.ref.current
    if (!widget) return

    const resizeArea = event.currentTarget
    const resizeBounds = resizeArea.getBoundingClientRect()
    const resizeTarget = getResizeTarget(event.clientX, event.clientY, resizeBounds)

    if (!resizeTarget) {
      const offsetX = event.clientX - (resizeBounds.left + resizeBounds.width / 2)
      const offsetY = event.clientY - (resizeBounds.top + resizeBounds.height / 2)
      const distance = Math.hypot(offsetX, offsetY)
      const radius = Math.min(resizeBounds.width, resizeBounds.height) / 2

      if (distance > radius + resizeHitArea) event.stopPropagation()
      return
    }

    const widgetBounds = widget.getBoundingClientRect()
    resizeStart.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      directionX: resizeTarget.directionX,
      directionY: resizeTarget.directionY,
      widgetLeft: widgetBounds.left,
      widgetTop: widgetBounds.top,
      size: resizeBounds.width,
    }

    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = resizeStart.current
    if (!start) {
      const resizeTarget = getResizeTarget(
        event.clientX,
        event.clientY,
        event.currentTarget.getBoundingClientRect(),
      )
      setResizeCursor(resizeTarget?.cursor ?? 'default')
      return
    }

    const widget = dragHandlers.ref.current
    if (!start || !widget || start.pointerId !== event.pointerId) return

    const deltaX = event.clientX - start.clientX
    const deltaY = event.clientY - start.clientY
    const radialDelta = deltaX * start.directionX + deltaY * start.directionY
    const nextSize = Math.max(minimumSize, start.size + radialDelta)
    const offsetX = ((start.size - nextSize) * (1 - start.directionX)) / 2
    const offsetY = ((start.size - nextSize) * (1 - start.directionY)) / 2

    widget.style.left = `${start.widgetLeft + offsetX}px`
    widget.style.top = `${start.widgetTop + offsetY}px`

    setSize(nextSize)
  }

  const finishResize = (event: PointerEvent<HTMLDivElement>) => {
    if (resizeStart.current?.pointerId === event.pointerId) {
      resizeStart.current = null
      const resizeTarget = getResizeTarget(
        event.clientX,
        event.clientY,
        event.currentTarget.getBoundingClientRect(),
      )
      setResizeCursor(resizeTarget?.cursor ?? 'default')
    }
  }

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
        className="camera__resize-area"
        style={{ width: size, height: size, cursor: resizeCursor }}
        onPointerDown={beginResize}
        onPointerMove={handlePointerMove}
        onPointerUp={finishResize}
        onPointerCancel={finishResize}
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