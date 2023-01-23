"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
function createWindow() {
    let myWindow;
    electron_1.app.on('ready', () => {
        const { width, height } = electron_1.screen.getPrimaryDisplay().workAreaSize;
        myWindow = new electron_1.BrowserWindow({
            width: width,
            height: height,
            frame: false,
            transparent: true,
            title: `Lone D Wisp Chatbot`,
        });
        myWindow.loadURL("./overlay.html");
    });
}
exports.default = createWindow;
createWindow();
//# sourceMappingURL=init.js.map