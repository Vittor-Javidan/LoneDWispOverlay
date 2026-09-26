import { useCallback, useRef, useState } from 'react'
import './Chatbox.css'

import { useDraggable, type DraggableHandlers } from '../../src/hooks/useDraggable'
import type { ChatboxPreferences, WidgetPosition } from '../OverlayWindow/OverlayPreferences'

import { useChatboxUrl } from './useChatboxUrl'
import { resizeDirections, useChatboxResize, type ChatboxResizeValues } from './useChatboxResize'

export default function Chatbox(props: {
  preferences: ChatboxPreferences
  onPreferencesChanged: (patch: Partial<ChatboxPreferences>) => void
}) {

  const contentScale = props.preferences.contentScalePercent / 100
  
  const widgetRef = useRef<HTMLElement>(null)
  const [dragHandlers, setDragHandlers] = useState<DraggableHandlers<HTMLElement> | null>(null)
  const [resizeValues, setResizeValues] = useState<ChatboxResizeValues | null>(null)
  const [chatboxUrl  , setChatboxUrl  ] = useState('')

  const handlePositionChange = useCallback((position: WidgetPosition) => {
    props.onPreferencesChanged({ position })
  }, [props.onPreferencesChanged])

  const handleResizeComplete = useCallback((values: {
    width: number
    height: number
    position: WidgetPosition
  }) => {
    props.onPreferencesChanged({
      width: values.width,
      height: values.height,
      position: values.position,
    })
  }, [props.onPreferencesChanged])


  useChatboxUrl({ onUrlLoaded: setChatboxUrl })

  useChatboxResize({
    widgetRef,
    initialFrameSize: {
      width: props.preferences.width,
      height: props.preferences.height,
    },
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
      className="widget chatbox-widget"
      onPointerDown={dragHandlers?.onPointerDown}
      onPointerMove={dragHandlers?.onPointerMove}
      onPointerUp={dragHandlers?.onPointerUp}
      onPointerCancel={dragHandlers?.onPointerCancel}
      aria-label="Chatbox"
    >
      <div
        className="chatbox__reference"
        style={resizeValues?.frameSize ?? {
          width: props.preferences.width,
          height: props.preferences.height,
        }}
      >
        <iframe
          className={`chatbox__frame${props.preferences.isHidden ? ' is-hidden' : ''}`}
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
            aria-pressed={props.preferences.isHidden}
            onClick={() => props.onPreferencesChanged({ isHidden: !props.preferences.isHidden })}
          >
            {props.preferences.isHidden ? 'Show' : 'Hide'}
          </button>
        </div>
        <div className="chatbox__control-row">
          <button
            className="chatbox__button chatbox__scale-button"
            type="button"
            aria-label="Increase chatbox content scale"
            disabled={props.preferences.contentScalePercent === 200}
            onClick={() => props.onPreferencesChanged({
              contentScalePercent: Math.min(props.preferences.contentScalePercent + 10, 200),
            })}
          >
            +
          </button>
          <button
            className="chatbox__button chatbox__scale-button"
            type="button"
            aria-label="Decrease chatbox content scale"
            disabled={props.preferences.contentScalePercent === 50}
            onClick={() => props.onPreferencesChanged({
              contentScalePercent: Math.max(props.preferences.contentScalePercent - 10, 50),
            })}
          >
            -
          </button>
        </div>
      </div>
    </section>
  )
}