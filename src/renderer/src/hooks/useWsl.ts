import { useState, useCallback, useEffect } from 'react'
import { message } from 'antd'
import i18n from '../i18n'
import type { WslDistro } from '../types'

const api = window.wslAPI

const HIDDEN_KEY = 'wsl-manager-hidden-distros'

function loadHidden(): string[] {
  try {
    return JSON.parse(localStorage.getItem(HIDDEN_KEY) || '[]')
  } catch {
    return []
  }
}

function saveHidden(list: string[]): void {
  localStorage.setItem(HIDDEN_KEY, JSON.stringify(list))
}

export function useWsl() {
  const [allDistros, setAllDistros] = useState<WslDistro[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})
  const [hiddenNames, setHiddenNames] = useState<string[]>(loadHidden)
  const [showHidden, setShowHidden] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const list = await api.listDistros()
      // Filter out Docker Desktop internal distros
      const filtered = list.filter(
        (d) => !['docker-desktop', 'docker-desktop-data', 'sandbox-temp'].includes(d.name.toLowerCase())
      )
      // Running distros first
      filtered.sort((a, b) => {
        if (a.state === b.state) return 0
        return a.state === 'Running' ? -1 : 1
      })
      setAllDistros(filtered)
    } catch (err: unknown) {
      message.error(i18n.t('messages.listError') + ': ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Derived: visible distros based on hidden list and toggle
  const distros = showHidden
    ? allDistros
    : allDistros.filter((d) => !hiddenNames.includes(d.name))

  const hiddenCount = allDistros.filter((d) => hiddenNames.includes(d.name)).length

  const hideDistro = useCallback((name: string) => {
    setHiddenNames((prev) => {
      const next = [...prev, name]
      saveHidden(next)
      return next
    })
    message.success(i18n.t('messages.hidden', { name }))
  }, [])

  const unhideDistro = useCallback((name: string) => {
    setHiddenNames((prev) => {
      const next = prev.filter((n) => n !== name)
      saveHidden(next)
      return next
    })
    message.success(i18n.t('messages.unhidden', { name }))
  }, [])

  const toggleShowHidden = useCallback(() => {
    setShowHidden((prev) => !prev)
  }, [])

  const withAction = useCallback(
    (key: string, fn: () => Promise<void>) => async () => {
      setActionLoading((prev) => ({ ...prev, [key]: true }))
      try {
        await fn()
        await refresh()
      } catch (err: unknown) {
        message.error(
          i18n.t('messages.actionError') + ': ' + (err instanceof Error ? err.message : String(err))
        )
      } finally {
        setActionLoading((prev) => ({ ...prev, [key]: false }))
      }
    },
    [refresh]
  )

  const startDistro = useCallback(
    (name: string) => withAction(`start-${name}`, () => api.startDistro(name))(),
    [withAction]
  )

  const stopDistro = useCallback(
    (name: string) => withAction(`stop-${name}`, () => api.stopDistro(name))(),
    [withAction]
  )

  const deleteDistro = useCallback(
    (name: string) => withAction(`delete-${name}`, () => api.deleteDistro(name))(),
    [withAction]
  )

  const cloneDistro = useCallback(
    (source: string, newName: string, installPath: string) =>
      withAction(`clone-${source}`, () => api.cloneDistro(source, newName, installPath))(),
    [withAction]
  )

  const exportDistro = useCallback(
    (name: string, filePath: string) =>
      withAction(`export-${name}`, () => api.exportDistro(name, filePath))(),
    [withAction]
  )

  const importDistro = useCallback(
    (name: string, installPath: string, filePath: string) =>
      withAction(`import-${name}`, () => api.importDistro(name, installPath, filePath))(),
    [withAction]
  )

  return {
    distros,
    loading,
    actionLoading,
    refresh,
    startDistro,
    stopDistro,
    deleteDistro,
    cloneDistro,
    exportDistro,
    importDistro,
    hiddenNames,
    hiddenCount,
    showHidden,
    hideDistro,
    unhideDistro,
    toggleShowHidden
  }
}
