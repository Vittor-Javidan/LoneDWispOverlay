import { app } from 'electron'
import { Service_Server_Camera } from '../Components/Camera/Service_Server'
import { Service_Server_Chatbox } from '../Components/Chatbox/Service_Server'
import { Service_Server_OverlayWindow } from '../Components/OverlayWindow/Service_Server'

app.whenReady().then(async () => {
  Service_Server_Chatbox.registerChatboxIpcHandler()
  await Service_Server_Camera.loadCameraPermission()
  await Service_Server_OverlayWindow.createWindow()
})

app.on('activate', () => {
  if (!Service_Server_OverlayWindow.hasWindow() && Service_Server_Camera.isCameraPermissionInitialized()) {
    void Service_Server_OverlayWindow.createWindow()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})