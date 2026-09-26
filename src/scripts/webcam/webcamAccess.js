let webcam = document.getElementById('webcam');
let webcamContainer = document.getElementById('webcam-container')

if (webcam && navigator.mediaDevices?.getUserMedia) {
	navigator.mediaDevices.getUserMedia({
		video: { width:500, height: 500 }
	}).then(function (stream) {
		webcam.srcObject = stream
	}).catch(function (error) { 
		console.log('something went wrong') 
		console.log(error)
	})
} else if (webcam) {
	console.log('getUserMedia not supported!')
}

/* 
	Credits to 'KIRUPA' youtube channel
	tutorial video: "Accessing Your Webcam in HTML"
*/
