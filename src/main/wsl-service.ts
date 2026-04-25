import { execFile, spawn } from 'child_process'
import { promisify } from 'util'
import { stat, readdir, readFile, writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { Transform } from 'stream'
import { ipcMain, shell, dialog, BrowserWindow, app, net } from 'electron'

const execFileAsync = promisify(execFile)

// --- Settings persistence ---
interface AppSettings {
  defaultInstallRoot: string
  language: string
  vscodePaths: Record<string, string>
}

const DEFAULT_SETTINGS: AppSettings = { defaultInstallRoot: '', language: '', vscodePaths: {} }

function settingsPath(): string {
  return join(app.getPath('userData'), 'settings.json')
}

async function getSettings(): Promise<AppSettings> {
  try {
    const raw = await readFile(settingsPath(), 'utf-8')
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

async function saveSettings(settings: AppSettings): Promise<void> {
  const p = settingsPath()
  await mkdir(dirname(p), { recursive: true })
  await writeFile(p, JSON.stringify(settings, null, 2), 'utf-8')
}

/** Inspect registry to find a common install root among existing WSL distros */
async function getDefaultInstallRoot(): Promise<string> {
  try {
    const { stdout } = await execFileAsync(
      'reg.exe',
      ['query', 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Lxss', '/s'],
      { encoding: 'utf8' }
    )
    const blocks = stdout.split(/\r?\n\r?\n/)
    const paths: string[] = []
    for (const block of blocks) {
      const pathMatch = block.match(/BasePath\s+REG_SZ\s+(.+)/)
      if (pathMatch) {
        const resolved = pathMatch[1].trim().replace(/^\\\\\?\\/, '')
        paths.push(dirname(resolved))
      }
    }
    if (paths.length > 0) {
      // Return the most common parent directory
      const freq: Record<string, number> = {}
      for (const p of paths) {
        freq[p] = (freq[p] || 0) + 1
      }
      return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]
    }
  } catch {
    // ignore
  }
  return 'C:\\WSL'
}

export interface WslDistro {
  name: string
  state: 'Running' | 'Stopped'
  version: number
  isDefault: boolean
  createdAt: string | null
  diskSize: number | null // bytes
}

/** Parse output of `wsl -l -v` */
function parseWslList(stdout: string): WslDistro[] {
  const lines = stdout.split('\n').filter((l) => l.trim().length > 0)
  // Skip header line
  const distros: WslDistro[] = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    const isDefault = line.startsWith('*')
    // Format: "* Name   State   VERSION" or "  Name   State   VERSION"
    const cleaned = line.replace('*', ' ')
    const parts = cleaned.trim().split(/\s{2,}/)
    if (parts.length >= 3) {
      distros.push({
        name: parts[0].trim(),
        state: parts[1].trim().toLowerCase().includes('running') ? 'Running' : 'Stopped',
        version: parseInt(parts[2].trim()) || 2,
        isDefault,
        createdAt: null,
        diskSize: null
      })
    }
  }
  return distros
}

async function listDistros(): Promise<WslDistro[]> {
  try {
    const { stdout } = await execFileAsync('wsl.exe', ['-l', '-v'], {
      encoding: 'utf16le'
    })
    const distros = parseWslList(stdout)
    // Enrich with creation time and disk size from registry BasePath
    await enrichDistroMeta(distros)
    return distros
  } catch {
    return []
  }
}

/** Get BasePath for each distro from registry and read dir creation time + vhdx size */
async function enrichDistroMeta(distros: WslDistro[]): Promise<void> {
  try {
    const { stdout } = await execFileAsync(
      'reg.exe',
      ['query', 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Lxss', '/s'],
      { encoding: 'utf8' }
    )
    const blocks = stdout.split(/\r?\n\r?\n/)
    const nameToPath: Record<string, string> = {}
    for (const block of blocks) {
      const nameMatch = block.match(/DistributionName\s+REG_SZ\s+(.+)/)
      const pathMatch = block.match(/BasePath\s+REG_SZ\s+(.+)/)
      if (nameMatch && pathMatch) {
        nameToPath[nameMatch[1].trim()] = pathMatch[1].trim()
      }
    }
    for (const distro of distros) {
      const basePath = nameToPath[distro.name]
      if (basePath) {
        const resolvedPath = basePath.replace(/^\\\\\?\\/, '')
        try {
          const stats = await stat(resolvedPath)
          distro.createdAt = stats.birthtime.toISOString()
        } catch {
          // ignore
        }
        // Find vhdx file size
        try {
          const files = await readdir(resolvedPath)
          const vhdx = files.find((f) => f.toLowerCase().endsWith('.vhdx'))
          if (vhdx) {
            const vhdxStats = await stat(`${resolvedPath}\\${vhdx}`)
            distro.diskSize = vhdxStats.size
          }
        } catch {
          // ignore
        }
      }
    }
  } catch {
    // ignore registry errors
  }
}

async function startDistro(name: string): Promise<void> {
  // Start a shell in the background, then detach
  const child = spawn('wsl.exe', ['-d', name, '--', 'sh', '-c', 'sleep 1'], {
    detached: true,
    stdio: 'ignore'
  })
  child.unref()
  // Wait a moment for it to start
  await new Promise((r) => setTimeout(r, 1500))
}

async function stopDistro(name: string): Promise<void> {
  await execFileAsync('wsl.exe', ['--terminate', name])
}

async function deleteDistro(name: string): Promise<void> {
  await execFileAsync('wsl.exe', ['--unregister', name])
}

async function cloneDistro(
  source: string,
  newName: string,
  installPath: string,
  onProgress?: (transferred: number) => void
): Promise<void> {
  // Use tar-based pipe (not --vhd) to create a fully independent distro
  return new Promise((resolve, reject) => {
    const exportProc = spawn('wsl.exe', ['--export', source, '-'], {
      stdio: ['ignore', 'pipe', 'pipe']
    })
    const importProc = spawn(
      'wsl.exe',
      ['--import', newName, installPath, '-'],
      {
        stdio: ['pipe', 'pipe', 'pipe']
      }
    )

    // Track transferred bytes through a passthrough transform
    let transferred = 0
    const meter = new Transform({
      transform(chunk, _encoding, callback) {
        transferred += chunk.length
        onProgress?.(transferred)
        callback(null, chunk)
      }
    })

    exportProc.stdout.pipe(meter).pipe(importProc.stdin)

    let errorMsg = ''
    exportProc.stderr.on('data', (d) => (errorMsg += d.toString()))
    importProc.stderr.on('data', (d) => (errorMsg += d.toString()))

    importProc.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(errorMsg || `Clone failed with code ${code}`))
    })
    exportProc.on('error', reject)
    importProc.on('error', reject)
  })
}

async function exportDistro(name: string, filePath: string): Promise<void> {
  await execFileAsync('wsl.exe', ['--export', name, filePath])
}

async function importDistro(
  name: string,
  installPath: string,
  filePath: string
): Promise<void> {
  await execFileAsync('wsl.exe', ['--import', name, installPath, filePath])
}

/** Get default user and ensure ~/workspace exists, return the workspace path */
async function getWorkspacePath(name: string): Promise<{ user: string; wsPath: string }> {
  let user = 'root'
  try {
    const { stdout } = await execFileAsync(
      'wsl.exe',
      ['-d', name, '--', 'whoami'],
      { encoding: 'utf8' }
    )
    const trimmed = stdout.trim()
    if (trimmed) user = trimmed
  } catch {
    // fallback to root
  }

  const wsPath = `/home/${user}/workspace`
  try {
    await execFileAsync(
      'wsl.exe',
      ['-d', name, '--', 'mkdir', '-p', wsPath],
      { encoding: 'utf8' }
    )
  } catch {
    // ignore
  }

  return { user, wsPath }
}

async function openTerminal(name: string): Promise<void> {
  const { wsPath } = await getWorkspacePath(name)
  // Try Windows Terminal first, fallback to cmd
  try {
    spawn('wt.exe', ['wsl.exe', '-d', name, '--cd', wsPath], {
      detached: true,
      stdio: 'ignore'
    }).unref()
  } catch {
    spawn('cmd.exe', ['/c', 'start', 'wsl.exe', '-d', name, '--cd', wsPath], {
      detached: true,
      stdio: 'ignore'
    }).unref()
  }
}

async function openVSCode(name: string): Promise<void> {
  // Use remembered path or default workspace
  const settings = await getSettings()
  const rememberedPath = settings.vscodePaths[name]
  let targetPath: string
  if (rememberedPath) {
    targetPath = rememberedPath
  } else {
    const { wsPath } = await getWorkspacePath(name)
    targetPath = wsPath
  }
  const folderUri = `vscode-remote://wsl+${name}${targetPath}`
  spawn('cmd.exe', ['/c', 'code', '--folder-uri', folderUri], {
    detached: true,
    stdio: 'ignore',
    shell: false
  }).unref()
}

async function openFileManager(name: string): Promise<void> {
  const { user } = await getWorkspacePath(name)
  shell.openPath(`\\\\wsl$\\${name}\\home\\${user}\\workspace`)
}

/** Register all IPC handlers */
export function registerWslHandlers(): void {
  ipcMain.handle('wsl:list', async () => {
    return await listDistros()
  })

  ipcMain.handle('wsl:start', async (_e, name: string) => {
    await startDistro(name)
  })

  ipcMain.handle('wsl:stop', async (_e, name: string) => {
    await stopDistro(name)
  })

  ipcMain.handle('wsl:delete', async (_e, name: string) => {
    await deleteDistro(name)
  })

  ipcMain.handle(
    'wsl:clone',
    async (_e, source: string, newName: string, installPath: string) => {
      const win = BrowserWindow.getFocusedWindow()
      let lastSent = 0
      await cloneDistro(source, newName, installPath, (transferred) => {
        // Throttle: send at most every 200ms worth of updates
        const now = Date.now()
        if (now - lastSent > 200) {
          lastSent = now
          win?.webContents.send('wsl:clone-progress', { transferred })
        }
      })
      // Send final 100% signal
      win?.webContents.send('wsl:clone-progress', { transferred: -1 })
    }
  )

  ipcMain.handle('wsl:export', async (_e, name: string, filePath: string) => {
    await exportDistro(name, filePath)
  })

  ipcMain.handle(
    'wsl:import',
    async (_e, name: string, installPath: string, filePath: string) => {
      await importDistro(name, installPath, filePath)
    }
  )

  ipcMain.handle('wsl:openTerminal', async (_e, name: string) => {
    await openTerminal(name)
  })

  ipcMain.handle('wsl:openFileManager', (_e, name: string) => {
    openFileManager(name)
  })

  ipcMain.handle('wsl:openVSCode', async (_e, name: string) => {
    await openVSCode(name)
  })

  ipcMain.handle('wsl:setVSCodePath', async (_e, name: string, path: string) => {
    const settings = await getSettings()
    settings.vscodePaths[name] = path
    await saveSettings(settings)
  })

  ipcMain.handle('wsl:getVSCodePath', async (_e, name: string) => {
    const settings = await getSettings()
    return settings.vscodePaths[name] || ''
  })

  ipcMain.handle('dialog:selectDirectory', async () => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return null
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory', 'createDirectory']
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle('dialog:selectFile', async (_e, extensions: string[]) => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return null
    const result = await dialog.showOpenDialog(win, {
      properties: ['openFile'],
      filters: [{ name: 'Files', extensions }]
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle('dialog:saveFile', async (_e, defaultName: string, extensions: string[]) => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return null
    const result = await dialog.showSaveDialog(win, {
      defaultPath: defaultName,
      filters: [{ name: 'Files', extensions }]
    })
    return result.canceled ? null : result.filePath
  })

  // Settings IPC
  ipcMain.handle('settings:get', async () => {
    return await getSettings()
  })

  ipcMain.handle('settings:set', async (_e, settings: AppSettings) => {
    await saveSettings(settings)
  })

  ipcMain.handle('settings:getDefaultInstallRoot', async () => {
    return await getDefaultInstallRoot()
  })

  // Update check
  ipcMain.handle('app:checkUpdate', async () => {
    const currentVersion = app.getVersion()
    try {
      const data = await new Promise<string>((resolve, reject) => {
        const request = net.request({
          method: 'GET',
          url: 'https://api.github.com/repos/modiao2018/WSL-Manager/releases/latest'
        })
        request.setHeader('User-Agent', 'WSL-Manager')
        let body = ''
        request.on('response', (response) => {
          response.on('data', (chunk) => { body += chunk.toString() })
          response.on('end', () => resolve(body))
        })
        request.on('error', reject)
        request.end()
      })
      const release = JSON.parse(data)
      const latestVersion = (release.tag_name || '').replace(/^v/, '')
      if (latestVersion && latestVersion !== currentVersion) {
        return {
          hasUpdate: true,
          currentVersion,
          latestVersion,
          releaseUrl: release.html_url || 'https://github.com/modiao2018/WSL-Manager/releases',
          releaseNotes: release.body || ''
        }
      }
      return { hasUpdate: false, currentVersion, latestVersion: currentVersion }
    } catch {
      return { hasUpdate: false, currentVersion, latestVersion: currentVersion }
    }
  })

  ipcMain.handle('app:openUrl', (_e, url: string) => {
    shell.openExternal(url)
  })

  ipcMain.handle('app:getVersion', () => {
    return app.getVersion()
  })
}
