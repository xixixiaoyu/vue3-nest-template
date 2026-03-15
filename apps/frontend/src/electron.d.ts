type ElectronSendChannel = 'toMain'
type ElectronReceiveChannel = 'fromMain'
type ElectronInvokeChannel = 'dialog:openFile' | 'dialog:saveFile'

export interface ElectronAPI {
  platform: NodeJS.Platform
  versions: {
    node: string
    chrome: string
    electron: string
  }
  send: (channel: ElectronSendChannel, ...args: unknown[]) => void
  receive: (channel: ElectronReceiveChannel, callback: (...args: unknown[]) => void) => () => void
  invoke: (channel: ElectronInvokeChannel, ...args: unknown[]) => Promise<unknown>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}
