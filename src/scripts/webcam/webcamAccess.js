let webcam = document.getElementById('webcam');
let webcamContainer = document.getElementById('webcam-container')

if (webcam && navigator.mediaDevices?.getUserMedia) {
	navigator.mediaDevices.getUserMedia({
		video: { width:500, height: 500 }
	}).then(function (stream) {
		webcam.srcObject = stream
	}).catch(function (error) {
		console.error('Unable to access the camera:', error)

		if (
			error.name === 'NotReadableError' ||
			error.name === 'AbortError' ||
			error.name === 'TrackStartError'
		) {
			window.alert(
				'A câmera não pôde ser iniciada. Ela pode estar em uso por outro aplicativo. ' +
				'Feche os outros aplicativos que usam a câmera e reinicie o overlay.'
			)
		}
	})
} else if (webcam) {
	console.log('getUserMedia not supported!')
}

/* 
	Credits to 'KIRUPA' youtube channel
	tutorial video: "Accessing Your Webcam in HTML"
*/
