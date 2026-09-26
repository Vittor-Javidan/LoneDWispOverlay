import './OverlayControls.css'

export default function OverlayControls(props: {
  isHoverHideEnabled: boolean
  onToggleHoverHide: () => void
  onMakeClickThrough: () => void
  onResetWidgets: () => void
}) {
  return (
    <div className="overlay-controls">
      <button
        className="overlay-controls__button"
        type="button"
        aria-pressed={props.isHoverHideEnabled}
        onClick={props.onToggleHoverHide}
      >
        Ocultar no hover
      </button>
      <button
        className="overlay-controls__button"
        type="button"
        onClick={props.onMakeClickThrough}
      >
        Tornar intangível
      </button>
      <button
        className="overlay-controls__button"
        type="button"
        onClick={props.onResetWidgets}
      >
        Restaurar widgets
      </button>
    </div>
  )
}