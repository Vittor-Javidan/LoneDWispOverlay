import { useEffect, type RefObject } from 'react'

export function useCameraStream(o: {
  videoRef: RefObject<HTMLVideoElement | null>
}): void {

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
        if (o.videoRef.current) o.videoRef.current.srcObject = cameraStream
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

  }, [o.videoRef])
}