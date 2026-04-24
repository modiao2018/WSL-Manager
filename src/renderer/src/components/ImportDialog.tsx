import { useState } from 'react'
import { Modal, Input, Button, Space, message } from 'antd'
import { FolderOpenOutlined, FileOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

interface ImportDialogProps {
  open: boolean
  onOk: (name: string, installPath: string, filePath: string) => Promise<void>
  onCancel: () => void
}

export function ImportDialog({ open, onOk, onCancel }: ImportDialogProps) {
  const [name, setName] = useState('')
  const [installPath, setInstallPath] = useState('')
  const [filePath, setFilePath] = useState('')
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()

  const handleSelectDir = async () => {
    const dir = await window.wslAPI.selectDirectory()
    if (dir) setInstallPath(dir)
  }

  const handleSelectFile = async () => {
    const file = await window.wslAPI.selectFile(['tar', 'tar.gz', 'vhdx'])
    if (file) setFilePath(file)
  }

  const handleOk = async () => {
    if (!name.trim()) {
      message.warning(t('importDialog.nameRequired'))
      return
    }
    if (!installPath.trim()) {
      message.warning(t('importDialog.pathRequired'))
      return
    }
    if (!filePath.trim()) {
      message.warning(t('importDialog.fileRequired'))
      return
    }
    setLoading(true)
    try {
      await onOk(name.trim(), installPath.trim(), filePath.trim())
      setName('')
      setInstallPath('')
      setFilePath('')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setName('')
    setInstallPath('')
    setFilePath('')
    onCancel()
  }

  return (
    <Modal
      title={t('importDialog.title')}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={t('importDialog.ok')}
      cancelText={t('importDialog.cancel')}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8 }}>{t('importDialog.nameLabel')}</div>
        <Input
          placeholder={t('importDialog.namePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8 }}>{t('importDialog.pathLabel')}</div>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder={t('importDialog.pathPlaceholder')}
            value={installPath}
            onChange={(e) => setInstallPath(e.target.value)}
            style={{ flex: 1 }}
          />
          <Button icon={<FolderOpenOutlined />} onClick={handleSelectDir} />
        </Space.Compact>
      </div>
      <div>
        <div style={{ marginBottom: 8 }}>{t('importDialog.fileLabel')}</div>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder={t('importDialog.filePlaceholder')}
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
            style={{ flex: 1 }}
          />
          <Button icon={<FileOutlined />} onClick={handleSelectFile} />
        </Space.Compact>
      </div>
    </Modal>
  )
}
