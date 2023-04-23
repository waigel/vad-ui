import { app, BrowserWindow, shell, ipcMain, ipcRenderer } from 'electron'
import { release } from 'node:os'
import { join } from 'node:path'
import { update } from './update'
import yargs from 'yargs';
import fs from 'fs';
import path from 'path';
// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//

interface Arguments {
  file?: string;
  audio?: string;
  vad?: string;
}

yargs.option('file', {
  alias: 'f',
  describe: 'Path to audio and vad file',
  type: 'string',
  conflicts: ['audio', 'vad'],
});

yargs.option('audio', {
  alias: 'a',
  describe: 'Path to audio file',
  type: 'string',
  conflicts: ['file'],
});

yargs.option('vad', {
  alias: 'v',
  describe: 'Path to VAD file',
  type: 'string',
  conflicts: ['file'],
});

const argv = yargs.parse(process.argv) as Arguments;

let audioFilePath = argv.audio
let vadFilePath = argv.vad 

if (process.env.VITE_DEV_SERVER_URL) {
  // if we are in dev mode, we can use test files default
  audioFilePath = "./test/common_voice_de_17299420.wav"
  vadFilePath = "./test/common_voice_de_17299420.vad"
}

if (argv.file) {
  audioFilePath = argv.file
  vadFilePath = argv.file.replace('.wav', '.vad')
}

if (!audioFilePath || !vadFilePath) {
  console.log('Audio / vad file not specified or file not specified')
  process.exit(1)
}
//Check if the files exist
if (!fs.existsSync(audioFilePath) || !fs.existsSync(vadFilePath)) {
  console.log('Audio or vad file does not exist')
  process.exit(1)
}


process.env.DIST_ELECTRON = join(__dirname, '../')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')


async function createWindow() {
  win = new BrowserWindow({
    title: 'VAD Ui',
    icon: join(process.env.PUBLIC, 'favicon.ico'),
    webPreferences: {
      webSecurity: false,
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (url) { // electron-vite-vue#298
    win.loadURL(url)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

  // Apply electron-updater
  update(win)
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})


function ensureFirstBackSlash(str: string) {
  return str.length > 0 && str.charAt(0) !== "/" ? "/" + str : str;
}

function uriFromPath(_path: string) {
  const pathName = path.resolve(_path).replace(/\\/g, "/");
  return encodeURI(ensureFirstBackSlash(pathName));
}

function uriFromPathWithFile(_path: string) {
  const pathName = path.resolve(_path).replace(/\\/g, "/");
  return encodeURI("file://" + ensureFirstBackSlash(pathName));
}


ipcMain.on('get-arguments', (event, arg) => {
  event.reply('get-arguments', {
    audioFilePath: uriFromPathWithFile(audioFilePath!),
    vadFilePath: uriFromPath(vadFilePath!),
    })
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})

