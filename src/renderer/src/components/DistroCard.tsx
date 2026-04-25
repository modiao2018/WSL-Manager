import { useState } from 'react'
import {
  Card,
  Tag,
  Button,
  Space,
  Popconfirm,
  Tooltip,
  message,
  Dropdown,
  Badge,
  Modal,
  Input
} from 'antd'
import type { MenuProps } from 'antd'
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  CopyOutlined,
  ExportOutlined,
  DeleteOutlined,
  CodeOutlined,
  FolderOpenOutlined,
  EllipsisOutlined,
  LinuxOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  DatabaseOutlined
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import type { WslDistro } from '../types'
import { CloneDialog } from './CloneDialog'

const VSCodeIcon = () => (
  <span role="img" style={{ display: 'inline-flex' }}>
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
      <path d="M746.222 102.4L529.408 319.214 339.968 170.666l-34.133 17.067L204.8 290.133v443.734l101.035 102.4 34.133 17.066L529.408 704.79l216.814 216.814L849.92 887.467V136.533L746.222 102.4zM339.968 623.27V400.73L471.04 512 339.968 623.27zm406.186 179.2L543.77 512l202.384-290.47v580.94z" />
    </svg>
  </span>
)

interface DistroCardProps {
  distro: WslDistro
  actionLoading: Record<string, boolean>
  onStart: (name: string) => Promise<void>
  onStop: (name: string) => Promise<void>
  onDelete: (name: string) => Promise<void>
  onClone: (source: string, newName: string, installPath: string) => Promise<void>
  onExport: (name: string, filePath: string) => Promise<void>
  onHide?: (name: string) => void
  onUnhide?: (name: string) => void
  isHidden?: boolean
}

export function DistroCard({
  distro,
  actionLoading,
  onStart,
  onStop,
  onDelete,
  onClone,
  onExport,
  onHide,
  onUnhide,
  isHidden
}: DistroCardProps) {
  const [cloneOpen, setCloneOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [vsCodePathOpen, setVsCodePathOpen] = useState(false)
  const [vsCodePath, setVsCodePath] = useState('')
  const { t, i18n } = useTranslation()
  const isRunning = distro.state === 'Running'
  const name = distro.name
  const dateLocale = i18n.language.startsWith('zh') ? 'zh-CN' : 'en-US'

  const formatSize = (bytes: number): string => {
    if (bytes >= 1024 ** 3) return (bytes / 1024 ** 3).toFixed(1) + ' GB'
    if (bytes >= 1024 ** 2) return (bytes / 1024 ** 2).toFixed(0) + ' MB'
    return (bytes / 1024).toFixed(0) + ' KB'
  }

  const handleExport = async () => {
    const filePath = await window.wslAPI.saveFile(`${name}.tar`, ['tar'])
    if (filePath) {
      await onExport(name, filePath)
      message.success(t('distroCard.exportSuccess'))
    }
  }

  const handleOpenTerminal = () => {
    window.wslAPI.openTerminal(name)
  }

  const handleOpenFiles = () => {
    window.wslAPI.openFileManager(name)
  }

  const handleOpenVSCode = () => {
    window.wslAPI.openVSCode(name)
  }

  const handleOpenVSCodePathDialog = async () => {
    const path = await window.wslAPI.getVSCodePath(name)
    setVsCodePath(path)
    setVsCodePathOpen(true)
  }

  const handleSaveVSCodePath = async () => {
    await window.wslAPI.setVSCodePath(name, vsCodePath.trim())
    setVsCodePathOpen(false)
    message.success(t('distroCard.vsCodePathSaved'))
  }

  const moreMenuItems: MenuProps['items'] = [
    {
      key: 'clone',
      icon: <CopyOutlined />,
      label: t('distroCard.clone'),
      onClick: () => setCloneOpen(true)
    },
    {
      key: 'export',
      icon: <ExportOutlined />,
      label: t('distroCard.export'),
      onClick: handleExport
    },
    {
      key: 'vscodePath',
      icon: <VSCodeIcon />,
      label: t('distroCard.setVSCodePath'),
      onClick: handleOpenVSCodePathDialog
    },
    { type: 'divider' },
    isHidden
      ? {
          key: 'unhide',
          icon: <EyeOutlined />,
          label: t('distroCard.unhide'),
          onClick: () => onUnhide?.(name)
        }
      : {
          key: 'hide',
          icon: <EyeInvisibleOutlined />,
          label: t('distroCard.hide'),
          onClick: () => onHide?.(name)
        },
    { type: 'divider' },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: t('distroCard.delete'),
      danger: true,
      onClick: () => setDeleteConfirm(true)
    }
  ]

  return (
    <>
      <Card
        hoverable
        style={{
          borderRadius: 12,
          border: isRunning ? '1px solid #b7eb8f' : '1px solid #f0f0f0',
          background: isRunning
            ? 'linear-gradient(135deg, #f6ffed 0%, #fff 100%)'
            : '#fff',
          transition: 'all 0.3s ease'
        }}
        styles={{
          body: { padding: '20px 24px' }
        }}
      >
        {/* Top row: icon + name + tags */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: isRunning
                ? 'linear-gradient(135deg, #52c41a, #73d13d)'
                : 'linear-gradient(135deg, #bfbfbf, #d9d9d9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
              flexShrink: 0
            }}
          >
            <LinuxOutlined style={{ fontSize: 22, color: '#fff' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#1a1a1a',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {name}
              </span>
              {distro.isDefault && (
                <Tag
                  color="blue"
                  style={{ borderRadius: 4, fontSize: 11, lineHeight: '18px', margin: 0 }}
                >
                  {t('distroCard.default')}
                </Tag>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'nowrap' }}>
              <Tooltip title={isRunning ? t('distroCard.running') : t('distroCard.stopped')}>
                <Badge status={isRunning ? 'success' : 'default'} />
              </Tooltip>
              <span style={{ fontSize: 12, color: '#8c8c8c' }}>WSL{distro.version}</span>
              {distro.diskSize != null && (
                <>
                  <span style={{ fontSize: 11, color: '#d9d9d9' }}>·</span>
                  <Tooltip title={t('distroCard.diskSize')}>
                    <span style={{ fontSize: 12, color: '#bfbfbf', whiteSpace: 'nowrap' }}>
                      {formatSize(distro.diskSize)}
                    </span>
                  </Tooltip>
                </>
              )}
              {distro.createdAt && (
                <>
                  <span style={{ fontSize: 11, color: '#d9d9d9' }}>·</span>
                  <Tooltip title={t('distroCard.createdAt')}>
                    <span style={{ fontSize: 12, color: '#bfbfbf', whiteSpace: 'nowrap' }}>
                      {new Date(distro.createdAt).toLocaleDateString(dateLocale)}
                    </span>
                  </Tooltip>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isRunning ? (
            <Tooltip title={t('distroCard.stop')}>
              <Button
                icon={<PauseCircleOutlined />}
                loading={actionLoading[`stop-${name}`]}
                onClick={() => onStop(name)}
                style={{ borderRadius: 8 }}
              />
            </Tooltip>
          ) : (
            <Tooltip title={t('distroCard.start')}>
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                loading={actionLoading[`start-${name}`]}
                onClick={() => onStart(name)}
                style={{ borderRadius: 8 }}
              />
            </Tooltip>
          )}

          <Tooltip title={t('distroCard.openTerminal')}>
            <Button
              icon={<CodeOutlined />}
              onClick={handleOpenTerminal}
              style={{ borderRadius: 8 }}
            />
          </Tooltip>

          <Tooltip title={t('distroCard.openVSCode')}>
            <Button
              icon={<VSCodeIcon />}
              onClick={handleOpenVSCode}
              style={{ borderRadius: 8, color: '#0078d4' }}
            />
          </Tooltip>

          <Tooltip title={t('distroCard.openFiles')}>
            <Button
              icon={<FolderOpenOutlined />}
              onClick={handleOpenFiles}
              style={{ borderRadius: 8 }}
            />
          </Tooltip>

          <div style={{ flex: 1 }} />

          <Dropdown menu={{ items: moreMenuItems }} trigger={['click']}>
            <Button
              icon={<EllipsisOutlined />}
              style={{ borderRadius: 8 }}
            />
          </Dropdown>
        </div>
      </Card>

      <Popconfirm
        title={t('distroCard.deleteTitle')}
        description={t('distroCard.deleteConfirm', { name })}
        open={deleteConfirm}
        onConfirm={async () => {
          await onDelete(name)
          setDeleteConfirm(false)
        }}
        onCancel={() => setDeleteConfirm(false)}
        okText={t('distroCard.deleteOk')}
        cancelText={t('distroCard.cancel')}
        okButtonProps={{ danger: true }}
      >
        <span />
      </Popconfirm>

      <CloneDialog
        open={cloneOpen}
        sourceName={name}
        sourceDiskSize={distro.diskSize}
        onOk={async (newName, installPath) => {
          await onClone(name, newName, installPath)
          setCloneOpen(false)
          message.success(t('distroCard.cloneSuccess'))
        }}
        onCancel={() => setCloneOpen(false)}
      />

      <Modal
        title={t('distroCard.vsCodePathTitle')}
        open={vsCodePathOpen}
        onOk={handleSaveVSCodePath}
        onCancel={() => setVsCodePathOpen(false)}
        okText={t('settings.ok')}
        cancelText={t('settings.cancel')}
      >
        <div style={{ marginTop: 8 }}>
          <Input
            placeholder={t('distroCard.vsCodePathPlaceholder')}
            value={vsCodePath}
            onChange={(e) => setVsCodePath(e.target.value)}
          />
        </div>
      </Modal>
    </>
  )
}
