"use strict";
const invertButton = document.getElementById('invert-button');
const hideButton = document.getElementById('hide-button');
const inscreaseSizeButton = document.getElementById('increase-button');
const decreaseSizeButton = document.getElementById('decrease-button');
if (invertButton !== null &&
    hideButton !== null &&
    inscreaseSizeButton !== null &&
    decreaseSizeButton !== null) {
    invertButton.addEventListener('click', () => {
        if (webcamContainer === null)
            return;
        webcamContainer.classList.toggle('inverted');
    });
    hideButton.addEventListener('click', () => {
        if (webcamContainer === null)
            return;
        webcamContainer.classList.toggle('no-video');
    });
    let resolutions = ["r150", "r200", "r250", "r300", "r350", "r400", "r450", "r500"];
    let index = 3;
    inscreaseSizeButton.addEventListener('click', () => {
        if (webcamContainer === null)
            return;
        if (index + 1 < resolutions.length) {
            webcam.classList.remove(resolutions[index]);
            webcamContainer.classList.remove(resolutions[index]);
            index++;
            webcam.classList.add(resolutions[index]);
            webcamContainer.classList.add(resolutions[index]);
        }
    });
    decreaseSizeButton.addEventListener('click', () => {
        if (webcamContainer === null)
            return;
        if (index - 1 >= 0) {
            webcam.classList.remove(resolutions[index]);
            webcamContainer.classList.remove(resolutions[index]);
            index--;
            webcam.classList.add(resolutions[index]);
            webcamContainer.classList.add(resolutions[index]);
        }
    });
}
//# sourceMappingURL=webcamButtons.js.map