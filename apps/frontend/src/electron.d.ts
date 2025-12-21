export interface ElectronAPI {
  platform: NodeJS.Platform
  versions: {
    node: string
    chrome: string
    electron: string
  }
  send: (channel: string, ...args: unknown[]) => void
  receive: (channel: string, callback: (...args: unknown[]) => void) => void
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}
