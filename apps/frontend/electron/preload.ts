import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'

const SEND_CHANNELS = ['toMain'] as const
const RECEIVE_CHANNELS = ['fromMain'] as const
const INVOKE_CHANNELS = ['dialog:openFile', 'dialog:saveFile'] as const

const SEND_CHANNEL_SET = new Set<string>(SEND_CHANNELS)
const RECEIVE_CHANNEL_SET = new Set<string>(RECEIVE_CHANNELS)
const INVOKE_CHANNEL_SET = new Set<string>(INVOKE_CHANNELS)

type SendChannel = (typeof SEND_CHANNELS)[number]
type ReceiveChannel = (typeof RECEIVE_CHANNELS)[number]
type InvokeChannel = (typeof INVOKE_CHANNELS)[number]

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
  send: (channel: SendChannel, ...args: unknown[]) => {
    if (SEND_CHANNEL_SET.has(channel)) {
      ipcRenderer.send(channel, ...args)
    }
  },

  receive: (channel: ReceiveChannel, callback: (...args: unknown[]) => void) => {
    if (RECEIVE_CHANNEL_SET.has(channel)) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) => callback(...args)
      ipcRenderer.on(channel, subscription)
      return () => {
        ipcRenderer.removeListener(channel, subscription)
      }
    }
    return () => {}
  },

  invoke: async (channel: InvokeChannel, ...args: unknown[]) => {
    if (INVOKE_CHANNEL_SET.has(channel)) {
      return await ipcRenderer.invoke(channel, ...args)
    }
    return null
  },
})
