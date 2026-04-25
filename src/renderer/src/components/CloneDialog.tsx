import { useState, useEffect, useRef } from 'react'
import { Modal, Input, Button, Space, Progress, message } from 'antd'
import { FolderOpenOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

interface CloneDialogProps {
  open: boolean
  sourceName: string
  sourceDiskSize: number | null
  onOk: (newName: string, installPath: string) => Promise<void>
  onCancel: () => void
}

export function CloneDialog({ open, sourceName, sourceDiskSize, onOk, onCancel }: CloneDialogProps) {
  const [newName, setNewName] = useState('')
  const [installPath, setInstallPath] = useState('')
  const [loading, setLoading] = useState(false)
  const [installRoot, setInstallRoot] = useState('')
  const [transferred, setTransferred] = useState(0)
  const [cloning, setCloning] = useState(false)
  const autoPathRef = useRef(true) // tracks whether path is auto-generated
  const { t } = useTranslation()

  const formatSize = (bytes: number): string => {
    if (bytes >= 1024 ** 3) return (bytes / 1024 ** 3).toFixed(1) + ' GB'
    if (bytes >= 1024 ** 2) return (bytes / 1024 ** 2).toFixed(0) + ' MB'
    return (bytes / 1024).toFixed(0) + ' KB'
  }

  // Load defaults when dialog opens
  useEffect(() => {
    if (open) {
      const defaultName = sourceName + '-clone'
      setNewName(defaultName)
      autoPathRef.current = true
      // Load install root from settings, fallback to system default
      ;(async () => {
        try {
          const settings = await window.wslAPI.getSettings()
          let root = settings.defaultInstallRoot
          if (!root) {
            root = await window.wslAPI.getDefaultInstallRoot()
          }
          setInstallRoot(root)
          setInstallPath(root + '\\' + defaultName)
        } catch {
          setInstallPath('')
        }
      })()
    }
  }, [open, sourceName])

  // Sync path when name changes (only if auto-generated)
  const handleNameChange = (value: string) => {
    setNewName(value)
    if (autoPathRef.current && installRoot) {
      setInstallPath(installRoot + '\\' + (value.trim() || sourceName + '-clone'))
    }
  }

  const handlePathChange = (value: string) => {
    setInstallPath(value)
    autoPathRef.current = false
  }

  const handleSelectDir = async () => {
    const dir = await window.wslAPI.selectDirectory()
    if (dir) {
      autoPathRef.current = false
      const name = newName.trim() || sourceName + '-clone'
      const sep = dir.includes('/') ? '/' : '\\'
      setInstallPath(dir + sep + name)
    }
  }

  const handleOk = async () => {
    if (!newName.trim()) {
      message.warning(t('cloneDialog.nameRequired'))
      return
    }
    if (!installPath.trim()) {
      message.warning(t('cloneDialog.pathRequired'))
      return
    }
    setLoading(true)
    setCloning(true)
    setTransferred(0)
    // Listen for progress
    window.wslAPI.onCloneProgress((data) => {
      if (data.transferred === -1) {
        // Clone complete
        setCloning(false)
      } else {
        setTransferred(data.transferred)
      }
    })
    try {
      await onOk(newName.trim(), installPath.trim())
      setNewName('')
      setInstallPath('')
      autoPathRef.current = true
    } finally {
      setLoading(false)
      setCloning(false)
      setTransferred(0)
      window.wslAPI.offCloneProgress()
    }
  }

  const handleCancel = () => {
    setNewName('')
    setInstallPath('')
    autoPathRef.current = true
    onCancel()
  }

  return (
    <Modal
      title={t('cloneDialog.title', { name: sourceName })}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={t('cloneDialog.ok')}
      cancelText={t('cloneDialog.cancel')}
    >
      {cloning ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Progress
            percent={sourceDiskSize ? Math.min(Math.round((transferred / sourceDiskSize) * 100), 99) : undefined}
            status="active"
            type={sourceDiskSize ? 'line' : 'line'}
            format={() => sourceDiskSize
              ? `${formatSize(transferred)} / ~${formatSize(sourceDiskSize)}`
              : formatSize(transferred)
            }
          />
          <div style={{ marginTop: 8, color: '#8c8c8c', fontSize: 13 }}>
            {t('cloneDialog.cloning')}
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8 }}>{t('cloneDialog.nameLabel')}</div>
            <Input
              placeholder={t('cloneDialog.namePlaceholder')}
              value={newName}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </div>
          <div>
            <div style={{ marginBottom: 8 }}>{t('cloneDialog.pathLabel')}</div>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder={t('cloneDialog.pathPlaceholder')}
                value={installPath}
                onChange={(e) => handlePathChange(e.target.value)}
                style={{ flex: 1 }}
              />
              <Button icon={<FolderOpenOutlined />} onClick={handleSelectDir} />
            </Space.Compact>
          </div>
        </>
      )}
    </Modal>
  )
}
