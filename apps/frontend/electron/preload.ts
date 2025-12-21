import { contextBridge, ipcRenderer } from 'electron'

// 暴露安全的 API 到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 平台信息
  platform: process.platform,

  // 版本信息
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },

  // IPC 通信示例
  send: (channel: string, ...args: unknown[]) => {
    const validChannels = ['toMain']
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, ...args)
    }
  },

  receive: (channel: string, callback: (...args: unknown[]) => void) => {
    const validChannels = ['fromMain']
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_event, ...args) => callback(...args))
    }
  },

  invoke: async (channel: string, ...args: unknown[]) => {
    const validChannels = ['dialog:openFile', 'dialog:saveFile']
    if (validChannels.includes(channel)) {
      return await ipcRenderer.invoke(channel, ...args)
    }
    return null
  },
})
