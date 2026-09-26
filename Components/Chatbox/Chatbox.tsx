import { useState } from 'react'
import './Chatbox.css'

import { useDraggable } from '../../src/hooks/useDraggable'

import { useChatboxUrl } from './useChatboxUrl'
import { resizeDirections, useChatboxResize, type ChatboxResizeValues } from './useChatboxResize'

export default function Chatbox() {
  const dragHandlers = useDraggable<HTMLElement>()

  const [resizeValues       , setResizeValues       ] = useState<ChatboxResizeValues | null>(null)
  const [chatboxUrl         , setChatboxUrl         ] = useState('')
  const [isHidden           , setIsHidden           ] = useState(false)
  const [contentScalePercent, setContentScalePercent] = useState(100)

  const contentScale = contentScalePercent / 100

  useChatboxUrl({ onUrlLoaded: setChatboxUrl })

  useChatboxResize({
    widgetRef: dragHandlers.ref,
    resizeCallback: setResizeValues,
  })

  return (
    <section className="widget chatbox-widget" {...dragHandlers} aria-label="Chatbox">
      <div
        className="chatbox__reference"
        style={resizeValues?.frameSize}
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
            onPointerDown={(event) => resizeValues?.beginResize(event, direction)}
            onPointerMove={resizeValues?.handlePointerMove}
            onPointerUp={resizeValues?.finishResize}
            onPointerCancel={resizeValues?.finishResize}
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