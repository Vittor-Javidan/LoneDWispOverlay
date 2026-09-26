const { app, BrowserWindow, dialog, screen } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');

process.loadEnvFile(path.join(__dirname, '..', '.env'));
const chatboxUrl = process.env.ENV_URL_CHATBOX_STREAMLABS;

if (!chatboxUrl) {
    throw new Error('ENV_URL_CHATBOX_STREAMLABS must be set in .env');
}

//OVERLAY ==========================================================================
/* 
    to make this overlay worth it, you need the "see through windows" open source application, by MOBZystem: https://www.mobzystems.com/tools/seethroughwindows.aspx
    this application makes every windows that you want an actuall overlay, just by having the window selected and pressing a shortcut of your desire.

    You can control transparent through the app, but the idea is to have actuall transparent html, like the one streamelements provide, or if you want to make your own
    overlay by just using HTML and CSS. Whatever you prefer.

    My personal preference will be to make my own html and css file, since i know how to make things draggable in html. So i can ajust in real time in any game.
*/

/** ====================================================
 * createWindow creates a new browser window with specified dimensions and transparency.
 * 
 * @returns {void}
 */
function createWindow() {

    let myWindow
    let cameraPermissionGranted = false

    
    app.on('ready', async () => {

        const cameraPermissionFile = path.join(app.getPath('userData'), 'camera-permission.json');

        try {
            const savedPermissions = JSON.parse(await fs.readFile(cameraPermissionFile, 'utf8'));
            cameraPermissionGranted = savedPermissions.camera === true;
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.error('Could not load camera permission:', error);
            }
        }
        
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;
        myWindow = new BrowserWindow({
            width: width,
            height: height,
            frame: false,
            transparent: true,

            icon: `../assets/images/Lone_Wisp_Logo_1024.png`,
            title: `LoneDWisp Overlay`,
            webPreferences: {
                backgroundThrottling: false,
            },
        })

        myWindow.webContents.session.setPermissionRequestHandler(
            (webContents, permission, callback, details) => {
                const isCameraRequest =
                    webContents === myWindow.webContents &&
                    permission === 'media' &&
                    details?.mediaTypes?.includes('video') === true;

                if (!isCameraRequest) {
                    callback(false);
                    return;
                }

                if (cameraPermissionGranted) {
                    callback(true);
                    return;
                }

                dialog.showMessageBox(myWindow, {
                    type: 'question',
                    title: 'Acesso à câmera',
                    message: 'Permitir que o LoneDWisp Overlay acesse sua câmera?',
                    detail: 'O vídeo da câmera será exibido no overlay.',
                    buttons: ['Permitir', 'Bloquear'],
                    defaultId: 0,
                    cancelId: 1,
                }).then(async ({ response }) => {
                    cameraPermissionGranted = response === 0;

                    if (cameraPermissionGranted) {
                        try {
                            await fs.mkdir(path.dirname(cameraPermissionFile), { recursive: true });
                            await fs.writeFile(
                                cameraPermissionFile,
                                JSON.stringify({ camera: true }),
                                'utf8'
                            );
                        } catch (error) {
                            console.error('Could not save camera permission:', error);
                        }
                    }

                    callback(cameraPermissionGranted);
                }).catch(() => callback(false));
            }
        );

        myWindow.webContents.once('dom-ready', () => {
            myWindow.webContents.executeJavaScript(
                `document.getElementById('chatbox').src = ${JSON.stringify(chatboxUrl)}`
            );
        });
    
        /**
         * Use your html url here, it can be a overlay link from streamelements
         * for example, or a local directory.
         */
        myWindow.loadURL(`${__dirname}/overlay.html`) 
    })
}

module.exports = createWindow;

