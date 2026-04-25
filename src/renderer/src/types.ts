export interface AppSettings {
  defaultInstallRoot: string
  language: string
  vscodePaths: Record<string, string>
}

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
  setVSCodePath: (name: string, path: string) => Promise<void>
  getVSCodePath: (name: string) => Promise<string>
  selectDirectory: () => Promise<string | null>
  selectFile: (extensions: string[]) => Promise<string | null>
  saveFile: (defaultName: string, extensions: string[]) => Promise<string | null>
  getSettings: () => Promise<AppSettings>
  setSettings: (settings: AppSettings) => Promise<void>
  getDefaultInstallRoot: () => Promise<string>
  onCloneProgress: (callback: (data: { transferred: number }) => void) => void
  offCloneProgress: () => void
  checkUpdate: () => Promise<{
    hasUpdate: boolean
    currentVersion: string
    latestVersion: string
    releaseUrl?: string
    releaseNotes?: string
  }>
  openUrl: (url: string) => Promise<void>
  getVersion: () => Promise<string>
}

declare global {
  interface Window {
    wslAPI: WslAPI
  }
}
