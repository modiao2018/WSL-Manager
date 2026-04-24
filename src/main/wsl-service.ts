import { execFile, spawn } from 'child_process'
import { promisify } from 'util'
import { stat, readdir } from 'fs/promises'
import { ipcMain, shell, dialog, BrowserWindow } from 'electron'

const execFileAsync = promisify(execFile)

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
  installPath: string
): Promise<void> {
  // Use a temp pipe: export source to stdout, import from stdin
  return new Promise((resolve, reject) => {
    const exportProc = spawn('wsl.exe', ['--export', source, '--vhd', '-'], {
      stdio: ['ignore', 'pipe', 'pipe']
    })
    const importProc = spawn(
      'wsl.exe',
      ['--import', newName, installPath, '--vhd', '-'],
      {
        stdio: ['pipe', 'pipe', 'pipe']
      }
    )

    exportProc.stdout.pipe(importProc.stdin)

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
  const { wsPath } = await getWorkspacePath(name)
  // code --folder-uri vscode-remote://wsl+<distro>/path
  const folderUri = `vscode-remote://wsl+${name}${wsPath}`
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
      await cloneDistro(source, newName, installPath)
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
}
