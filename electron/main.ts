import { app } from 'electron'
import { Service_Camera } from '../Components/Camera/Service'
import { Service_Chatbox } from '../Components/Chatbox/Service'
import { Service_OverlayWindow } from '../Components/OverlayWindow/Service'

app.whenReady().then(async () => {
  Service_Chatbox.registerChatboxIpcHandler()
  await Service_Camera.loadCameraPermission()
  await Service_OverlayWindow.createWindow()
})

app.on('activate', () => {
  if (!Service_OverlayWindow.hasWindow() && Service_Camera.isCameraPermissionInitialized()) {
    void Service_OverlayWindow.createWindow()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})