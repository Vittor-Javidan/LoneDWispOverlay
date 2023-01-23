"use strict";
let webcam = document.getElementById('webcam');
let webcamContainer = document.getElementById('webcam-container');
if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: { width: 500, height: 500 } })
        .then(function (stream) { webcam.srcObject = stream; })
        .catch(function (error) {
        console.log('something went wrong');
        console.log(error);
    });
}
else {
    console.log('getUserMedia not supported!');
}
//# sourceMappingURL=webcamAccess.js.map