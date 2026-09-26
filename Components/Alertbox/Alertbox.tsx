import { useCallback, useRef, useState } from 'react'
import './Alertbox.css'

import { useDraggable, type DraggableHandlers } from '../../src/hooks/useDraggable'
import type { AlertboxPreferences, WidgetPosition } from '../OverlayWindow/OverlayPreferences'
import { resizeDirections, useWidgetResize, type WidgetResizeValues } from '../../src/hooks/useWidgetResize'

import { useAlertboxUrl } from './useAlertboxUrl'

export default function Alertbox(props: {
  preferences: AlertboxPreferences
  onPreferencesChanged: (patch: Partial<AlertboxPreferences>) => void
}) {

  const widgetRef = useRef<HTMLElement>(null)
  const [dragHandlers, setDragHandlers] = useState<DraggableHandlers<HTMLElement> | null>(null)
  const [resizeValues, setResizeValues] = useState<WidgetResizeValues | null>(null)
  const [alertboxUrl, setAlertboxUrl] = useState('')

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

  useAlertboxUrl({ onUrlLoaded: setAlertboxUrl })

  useWidgetResize({
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

  if (!alertboxUrl) return null

  return (
    <section
      ref={widgetRef}
      className="widget alertbox-widget"
      onPointerDown={dragHandlers?.onPointerDown}
      onPointerMove={dragHandlers?.onPointerMove}
      onPointerUp={dragHandlers?.onPointerUp}
      onPointerCancel={dragHandlers?.onPointerCancel}
      aria-label="Alertbox"
    >
      <div
        className="alertbox__reference"
        style={resizeValues?.frameSize ?? {
          width: props.preferences.width,
          height: props.preferences.height,
        }}
      >
        <iframe
          className={`alertbox__frame${props.preferences.isHidden ? ' is-hidden' : ''}`}
          src={alertboxUrl}
          title="Alertbox"
          allow="autoplay"
          referrerPolicy="no-referrer"
        />
        <div className="alertbox__overlay">Alertbox</div>
        {resizeDirections.map((direction) => (
          <div
            key={direction}
            className={`alertbox__resize-handle alertbox__resize-handle--${direction}`}
            aria-hidden="true"
            onPointerDown={(event) => resizeValues?.beginResize(event, direction)}
            onPointerMove={resizeValues?.handlePointerMove}
            onPointerUp={resizeValues?.finishResize}
            onPointerCancel={resizeValues?.finishResize}
          />
        ))}
      </div>
      <div className="alertbox__controls">
        <button
          className="alertbox__button alertbox__hide-button"
          type="button"
          aria-pressed={props.preferences.isHidden}
          onClick={() => props.onPreferencesChanged({ isHidden: !props.preferences.isHidden })}
        >
          {props.preferences.isHidden ? 'Show' : 'Hide'}
        </button>
      </div>
    </section>
  )
}