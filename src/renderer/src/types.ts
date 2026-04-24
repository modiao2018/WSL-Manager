export interface WslDistro {
  name: string
  state: 'Running' | 'Stopped'
  version: number
  isDefault: boolean
  createdAt: string | null
  diskSize: number | null
}

export interface WslAPI {
  listDistros: () => Promise<WslDistro[]>
  startDistro: (name: string) => Promise<void>
  stopDistro: (name: string) => Promise<void>
  deleteDistro: (name: string) => Promise<void>
  cloneDistro: (source: string, newName: string, installPath: string) => Promise<void>
  exportDistro: (name: string, filePath: string) => Promise<void>
  importDistro: (name: string, installPath: string, filePath: string) => Promise<void>
  openTerminal: (name: string) => Promise<void>
  openFileManager: (name: string) => Promise<void>
  openVSCode: (name: string) => Promise<void>
  selectDirectory: () => Promise<string | null>
  selectFile: (extensions: string[]) => Promise<string | null>
  saveFile: (defaultName: string, extensions: string[]) => Promise<string | null>
}

declare global {
  interface Window {
    wslAPI: WslAPI
  }
}
