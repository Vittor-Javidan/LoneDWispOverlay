import { useEffect, type RefObject } from 'react'

export function useCameraStream(o: {
  videoRef: RefObject<HTMLVideoElement | null>
  enabled: boolean
  onReadyChanged: (isReady: boolean) => void
}): void {

  useEffect(() => {
    const video = o.videoRef.current

    if (!o.enabled) {
      o.onReadyChanged(false)
      if (video) video.srcObject = null
      return
    }

    let stream: MediaStream | null = null
    let isMounted = true
    const handlePlaying = () => o.onReadyChanged(true)

    o.onReadyChanged(false)
    video?.addEventListener('playing', handlePlaying)

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
        if (video) video.srcObject = cameraStream
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
      video?.removeEventListener('playing', handlePlaying)
      if (video?.srcObject === stream) video.srcObject = null
      stream?.getTracks().forEach((track) => track.stop())
    }

  }, [o.enabled, o.onReadyChanged, o.videoRef])
}