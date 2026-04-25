import { useState, useEffect } from 'react'
import { Modal, Input, Button, Space, Select, Typography, message } from 'antd'
import { FolderOpenOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { setLanguage } from '../i18n'

const { Text } = Typography

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const [installRoot, setInstallRoot] = useState('')
  const [language, setLang] = useState('')
  const [loading, setLoading] = useState(false)
  const { t, i18n } = useTranslation()

  useEffect(() => {
    if (open) {
      setLang(i18n.language.startsWith('zh') ? 'zh' : 'en')
      ;(async () => {
        try {
          const settings = await window.wslAPI.getSettings()
          if (settings.defaultInstallRoot) {
            setInstallRoot(settings.defaultInstallRoot)
          } else {
            const root = await window.wslAPI.getDefaultInstallRoot()
            setInstallRoot(root)
          }
        } catch {
          // ignore
        }
      })()
    }
  }, [open, i18n.language])

  const handleLangChange = (value: string) => {
    setLang(value)
    setLanguage(value)
  }

  const handleSelectDir = async () => {
    const dir = await window.wslAPI.selectDirectory()
    if (dir) {
      setInstallRoot(dir)
    }
  }

  const handleOk = async () => {
    setLoading(true)
    try {
      const settings = await window.wslAPI.getSettings()
      await window.wslAPI.setSettings({
        ...settings,
        defaultInstallRoot: installRoot.trim(),
        language
      })
      message.success(t('settings.saveSuccess'))
      onClose()
    } catch (err: unknown) {
      message.error(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={t('settings.title')}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading}
      okText={t('settings.ok')}
      cancelText={t('settings.cancel')}
      width={520}
    >
      {/* General Section */}
      <div style={{ marginBottom: 4 }}>
        <Text strong style={{ fontSize: 13, color: '#1677ff' }}>{t('settings.generalSection')}</Text>
      </div>
      <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text>{t('settings.languageLabel')}</Text>
          <Select
            value={language}
            onChange={handleLangChange}
            style={{ width: 160 }}
            options={[
              { value: 'zh', label: '中文' },
              { value: 'en', label: 'English' }
            ]}
          />
        </div>
      </div>

      {/* Paths Section */}
      <div style={{ marginBottom: 4 }}>
        <Text strong style={{ fontSize: 13, color: '#1677ff' }}>{t('settings.pathSection')}</Text>
      </div>
      <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
        <div style={{ marginBottom: 8 }}>
          <Text>{t('settings.installRootLabel')}</Text>
        </div>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder={t('settings.installRootPlaceholder')}
            value={installRoot}
            onChange={(e) => setInstallRoot(e.target.value)}
            style={{ flex: 1 }}
          />
          <Button icon={<FolderOpenOutlined />} onClick={handleSelectDir} />
        </Space.Compact>
      </div>
    </Modal>
  )
}
