import { contextBridge, ipcRenderer } from 'electron'

export interface WslDistro {
  name: string
  state: 'Running' | 'Stopped'
  version: number
  isDefault: boolean
}

const wslAPI = {
  listDistros: (): Promise<WslDistro[]> => ipcRenderer.invoke('wsl:list'),
  startDistro: (name: string): Promise<void> => ipcRenderer.invoke('wsl:start', name),
  stopDistro: (name: string): Promise<void> => ipcRenderer.invoke('wsl:stop', name),
  deleteDistro: (name: string): Promise<void> => ipcRenderer.invoke('wsl:delete', name),
  cloneDistro: (source: string, newName: string, installPath: string): Promise<void> =>
    ipcRenderer.invoke('wsl:clone', source, newName, installPath),
  exportDistro: (name: string, filePath: string): Promise<void> =>
    ipcRenderer.invoke('wsl:export', name, filePath),
  importDistro: (name: string, installPath: string, filePath: string): Promise<void> =>
    ipcRenderer.invoke('wsl:import', name, installPath, filePath),
  openTerminal: (name: string): Promise<void> => ipcRenderer.invoke('wsl:openTerminal', name),
  openFileManager: (name: string): Promise<void> =>
    ipcRenderer.invoke('wsl:openFileManager', name),
  openVSCode: (name: string): Promise<void> => ipcRenderer.invoke('wsl:openVSCode', name),
  selectDirectory: (): Promise<string | null> => ipcRenderer.invoke('dialog:selectDirectory'),
  selectFile: (extensions: string[]): Promise<string | null> =>
    ipcRenderer.invoke('dialog:selectFile', extensions),
  saveFile: (defaultName: string, extensions: string[]): Promise<string | null> =>
    ipcRenderer.invoke('dialog:saveFile', defaultName, extensions)
}

contextBridge.exposeInMainWorld('wslAPI', wslAPI)

export type WslAPI = typeof wslAPI
