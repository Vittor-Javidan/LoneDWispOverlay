"use strict";
const body = document.getElementById('body');
const widgets = document.querySelectorAll('.widget');
widgets.forEach(widget => {
    makeDraggable(widget);
});
function makeDraggable(child) {
    let currentX = 0;
    let currentY = 0;
    let isDragging = false;
    child.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousemove', onMouseMove);
    function onMouseDown(e) {
        isDragging = true;
        currentX = e.clientX;
        currentY = e.clientY;
    }
    function onMouseUp() {
        isDragging = false;
    }
    function onMouseMove(e) {
        if (isDragging) {
            const offsetX = e.clientX - currentX;
            const offsetY = e.clientY - currentY;
            child.style.top = `${child.offsetTop + offsetY}px`;
            child.style.left = `${child.offsetLeft + offsetX}px`;
            currentX = e.clientX;
            currentY = e.clientY;
        }
    }
}
//# sourceMappingURL=draggable.js.map