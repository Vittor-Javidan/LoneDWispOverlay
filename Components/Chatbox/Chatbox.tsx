import { useEffect, useState } from 'react'
import { useDraggable } from '../../src/hooks/useDraggable'
import './Chatbox.css'

export default function Chatbox() {
  const dragHandlers = useDraggable<HTMLElement>()
  const [chatboxUrl, setChatboxUrl] = useState('')
  const [isHidden, setIsHidden] = useState(false)

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
      <div className="chatbox__reference">
        <iframe
          className={`chatbox__frame${isHidden ? ' is-hidden' : ''}`}
          src={chatboxUrl || undefined}
          title="Chatbox"
          referrerPolicy="no-referrer"
        />
        <div className="chatbox__overlay">ChatBox</div>
      </div>
      <div className="chatbox__controls">
        <button
          className="chatbox__button"
          type="button"
          aria-pressed={isHidden}
          onClick={() => setIsHidden((current) => !current)}
        >
          {isHidden ? 'Show' : 'Hide'}
        </button>
      </div>
    </section>
  )
}