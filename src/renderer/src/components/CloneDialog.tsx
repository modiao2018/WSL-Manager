import { useState } from 'react'
import { Modal, Input, Button, Space, message } from 'antd'
import { FolderOpenOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

interface CloneDialogProps {
  open: boolean
  sourceName: string
  onOk: (newName: string, installPath: string) => Promise<void>
  onCancel: () => void
}

export function CloneDialog({ open, sourceName, onOk, onCancel }: CloneDialogProps) {
  const [newName, setNewName] = useState('')
  const [installPath, setInstallPath] = useState('')
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()

  const handleSelectDir = async () => {
    const dir = await window.wslAPI.selectDirectory()
    if (dir) {
      // Auto-append distro name as subdirectory
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
    try {
      await onOk(newName.trim(), installPath.trim())
      setNewName('')
      setInstallPath('')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setNewName('')
    setInstallPath('')
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
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8 }}>{t('cloneDialog.nameLabel')}</div>
        <Input
          placeholder={t('cloneDialog.namePlaceholder')}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
      </div>
      <div>
        <div style={{ marginBottom: 8 }}>{t('cloneDialog.pathLabel')}</div>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder={t('cloneDialog.pathPlaceholder')}
            value={installPath}
            onChange={(e) => setInstallPath(e.target.value)}
            style={{ flex: 1 }}
          />
          <Button icon={<FolderOpenOutlined />} onClick={handleSelectDir} />
        </Space.Compact>
      </div>
    </Modal>
  )
}
