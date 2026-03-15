import { app, BrowserWindow, session, shell } from 'electron'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

// ESM 兼容：手动定义 __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 禁用 Windows 7 的 GPU 加速
app.disableHardwareAcceleration()

// Windows 单例锁
if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let mainWindow: BrowserWindow | null = null

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
const isDev = Boolean(VITE_DEV_SERVER_URL)

function isHttpUrl(url: string) {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function openExternalIfSafe(url: string) {
  if (isHttpUrl(url)) {
    void shell.openExternal(url)
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      devTools: isDev,
    },
  })

  // 窗口准备好后再显示，避免白屏闪烁
  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  // 外部链接用默认浏览器打开
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    openExternalIfSafe(url)
    return { action: 'deny' }
  })

  // 阻止导航到外部站点，统一使用系统浏览器打开
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url !== mainWindow?.webContents.getURL()) {
      event.preventDefault()
      openExternalIfSafe(url)
    }
  })

  // 开发环境加载 dev server，生产环境加载打包文件
  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  // 默认拒绝渲染进程权限请求，按需白名单放开
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false)
  })

  // 设置 Content Security Policy
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const csp = isDev
      ? "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' ws: wss: http: https:; img-src 'self' data: blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
      : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' http: https:; img-src 'self' data: blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"

    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp],
      },
    })
  })

  createWindow()
})

app.on('window-all-closed', () => {
  mainWindow = null
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
