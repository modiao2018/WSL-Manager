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
  setVSCodePath: (name: string, path: string): Promise<void> =>
    ipcRenderer.invoke('wsl:setVSCodePath', name, path),
  getVSCodePath: (name: string): Promise<string> =>
    ipcRenderer.invoke('wsl:getVSCodePath', name),
  selectDirectory: (): Promise<string | null> => ipcRenderer.invoke('dialog:selectDirectory'),
  selectFile: (extensions: string[]): Promise<string | null> =>
    ipcRenderer.invoke('dialog:selectFile', extensions),
  saveFile: (defaultName: string, extensions: string[]): Promise<string | null> =>
    ipcRenderer.invoke('dialog:saveFile', defaultName, extensions),
  getSettings: (): Promise<{ defaultInstallRoot: string; language: string; vscodePaths: Record<string, string> }> => ipcRenderer.invoke('settings:get'),
  setSettings: (settings: { defaultInstallRoot: string; language: string; vscodePaths: Record<string, string> }): Promise<void> =>
    ipcRenderer.invoke('settings:set', settings),
  getDefaultInstallRoot: (): Promise<string> => ipcRenderer.invoke('settings:getDefaultInstallRoot'),
  onCloneProgress: (callback: (data: { transferred: number }) => void): void => {
    ipcRenderer.on('wsl:clone-progress', (_e, data) => callback(data))
  },
  offCloneProgress: (): void => {
    ipcRenderer.removeAllListeners('wsl:clone-progress')
  },
  checkUpdate: (): Promise<{
    hasUpdate: boolean
    currentVersion: string
    latestVersion: string
    releaseUrl?: string
    releaseNotes?: string
  }> => ipcRenderer.invoke('app:checkUpdate'),
  openUrl: (url: string): Promise<void> => ipcRenderer.invoke('app:openUrl', url),
  getVersion: (): Promise<string> => ipcRenderer.invoke('app:getVersion')
}

contextBridge.exposeInMainWorld('wslAPI', wslAPI)

export type WslAPI = typeof wslAPI
