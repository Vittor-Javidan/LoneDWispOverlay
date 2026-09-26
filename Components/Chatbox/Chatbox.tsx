import { useEffect, useState } from 'react'
import { useRef, type PointerEvent } from 'react'
import { useDraggable } from '../../src/hooks/useDraggable'
import './Chatbox.css'

const resizeDirections = [
  'top',
  'top-right',
  'right',
  'bottom-right',
  'bottom',
  'bottom-left',
  'left',
  'top-left',
] as const

type ResizeDirection = (typeof resizeDirections)[number]

type ResizeStart = {
  pointerId: number
  direction: ResizeDirection
  clientX: number
  clientY: number
  widgetLeft: number
  widgetTop: number
  width: number
  height: number
}

const minimumWidth = 250
const minimumHeight = 120

export default function Chatbox() {
  const dragHandlers = useDraggable<HTMLElement>()
  const resizeStart = useRef<ResizeStart | null>(null)
  const [chatboxUrl, setChatboxUrl] = useState('')
  const [isHidden, setIsHidden] = useState(false)
  const [frameSize, setFrameSize] = useState({ width: 550, height: 250 })
  const [contentScalePercent, setContentScalePercent] = useState(100)
  const contentScale = contentScalePercent / 100

  const beginResize = (event: PointerEvent<HTMLDivElement>, direction: ResizeDirection) => {
    if (event.button !== 0) return

    const widget = dragHandlers.ref.current
    const reference = event.currentTarget.parentElement
    if (!widget || !reference) return

    const widgetBounds = widget.getBoundingClientRect()
    const referenceBounds = reference.getBoundingClientRect()
    resizeStart.current = {
      pointerId: event.pointerId,
      direction,
      clientX: event.clientX,
      clientY: event.clientY,
      widgetLeft: widgetBounds.left,
      widgetTop: widgetBounds.top,
      width: referenceBounds.width,
      height: referenceBounds.height,
    }

    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const resize = (event: PointerEvent<HTMLDivElement>) => {
    const start = resizeStart.current
    const widget = dragHandlers.ref.current
    if (!start || !widget || start.pointerId !== event.pointerId) return

    const deltaX = event.clientX - start.clientX
    const deltaY = event.clientY - start.clientY
    const width = Math.max(
      minimumWidth,
      start.width + (start.direction.includes('left') ? -deltaX : start.direction.includes('right') ? deltaX : 0),
    )
    const height = Math.max(
      minimumHeight,
      start.height + (start.direction.includes('top') ? -deltaY : start.direction.includes('bottom') ? deltaY : 0),
    )

    if (start.direction.includes('left')) {
      widget.style.left = `${start.widgetLeft + start.width - width}px`
    }
    if (start.direction.includes('top')) {
      widget.style.top = `${start.widgetTop + start.height - height}px`
    }

    setFrameSize({ width, height })
  }

  const finishResize = (event: PointerEvent<HTMLDivElement>) => {
    if (resizeStart.current?.pointerId === event.pointerId) {
      resizeStart.current = null
    }
  }

  useEffect(() => {
    let isMounted = true

    void window.overlay.getChatboxUrl().then((url) => {
      if (isMounted) setChatboxUrl(url)
    }).catch((error: unknown) => {
      console.error('Unable to load the chatbox URL:', error)
    })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className="widget chatbox-widget" {...dragHandlers} aria-label="Chatbox">
      <div
        className="chatbox__reference"
        style={{ width: frameSize.width, height: frameSize.height }}
      >
        <iframe
          className={`chatbox__frame${isHidden ? ' is-hidden' : ''}`}
          src={chatboxUrl || undefined}
          title="Chatbox"
          referrerPolicy="no-referrer"
          style={{
            width: `${100 / contentScale}%`,
            height: `${100 / contentScale}%`,
            transform: `scale(${contentScale})`,
            transformOrigin: 'top left',
          }}
        />
        <div className="chatbox__overlay">ChatBox</div>
        {resizeDirections.map((direction) => (
          <div
            key={direction}
            className={`chatbox__resize-handle chatbox__resize-handle--${direction}`}
            aria-hidden="true"
            onPointerDown={(event) => beginResize(event, direction)}
            onPointerMove={resize}
            onPointerUp={finishResize}
            onPointerCancel={finishResize}
          />
        ))}
      </div>
      <div className="chatbox__controls">
        <div className="chatbox__control-row">
          <button
            className="chatbox__button chatbox__hide-button"
            type="button"
            aria-pressed={isHidden}
            onClick={() => setIsHidden((current) => !current)}
          >
            {isHidden ? 'Show' : 'Hide'}
          </button>
        </div>
        <div className="chatbox__control-row">
          <button
            className="chatbox__button chatbox__scale-button"
            type="button"
            aria-label="Increase chatbox content scale"
            disabled={contentScalePercent === 200}
            onClick={() => setContentScalePercent((current) => Math.min(current + 10, 200))}
          >
            +
          </button>
          <button
            className="chatbox__button chatbox__scale-button"
            type="button"
            aria-label="Decrease chatbox content scale"
            disabled={contentScalePercent === 50}
            onClick={() => setContentScalePercent((current) => Math.max(current - 10, 50))}
          >
            -
          </button>
        </div>
      </div>
    </section>
  )
}