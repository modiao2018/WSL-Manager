import { useState, useEffect } from 'react'
import { ConfigProvider, Layout, Button, Space, Typography, message, theme, Tooltip, Modal } from 'antd'
import logoIcon from './assets/icon.png'
import { ReloadOutlined, ImportOutlined, EyeOutlined, EyeInvisibleOutlined, SettingOutlined, GithubOutlined } from '@ant-design/icons'
import zhCN from 'antd/locale/zh_CN'
import enUS from 'antd/locale/en_US'
import { useTranslation } from 'react-i18next'
import { useWsl } from './hooks/useWsl'
import { DistroList } from './components/DistroList'
import { ImportDialog } from './components/ImportDialog'
import { SettingsDialog } from './components/SettingsDialog'
import './types'

const { Content } = Layout
const { Text } = Typography

export default function App() {
  const {
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
  } = useWsl()

  const [importOpen, setImportOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [appVersion, setAppVersion] = useState('')
  const { t, i18n } = useTranslation()

  // Fetch app version & check for updates on mount
  useEffect(() => {
    window.wslAPI.getVersion().then(setAppVersion)
    window.wslAPI.checkUpdate().then((info) => {
      if (info.hasUpdate) {
        Modal.confirm({
          title: t('update.newVersion'),
          content: (
            <div>
              <p>{t('update.currentVersion', { current: info.currentVersion })}</p>
              <p>{t('update.latestVersion', { latest: info.latestVersion })}</p>
            </div>
          ),
          okText: t('update.goDownload'),
          cancelText: t('update.later'),
          onOk: () => {
            window.wslAPI.openUrl(info.releaseUrl || 'https://github.com/modiao2018/WSL-Manager/releases')
          }
        })
      }
    })
  }, [])

  const runningCount = distros.filter((d) => d.state === 'Running').length
  const isZh = i18n.language.startsWith('zh')

  return (
    <ConfigProvider
      locale={isZh ? zhCN : enUS}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          borderRadius: 8,
          colorPrimary: '#1677ff',
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
        }
      }}
    >
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            padding: '20px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            // @ts-expect-error electron css property
            WebkitAppRegion: 'drag'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src={logoIcon} alt="logo" style={{ width: 44, height: 44, borderRadius: 10 }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 17, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>
                  WSL Manager
                </span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>
                  {appVersion ? `v${appVersion}` : ''}
                </span>
              </div>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                {t('header.stats', { total: distros.length, running: runningCount })}
              </Text>
            </div>
          </div>
          {/* @ts-expect-error electron css property */}
          <Space style={{ WebkitAppRegion: 'no-drag' }}>
            {hiddenCount > 0 && (
              <Tooltip title={showHidden ? t('header.hiddenShown') : t('header.hiddenCount', { count: hiddenCount })}>
                <Button
                  icon={showHidden ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  onClick={toggleShowHidden}
                  ghost
                  style={{
                    borderRadius: 8,
                    borderColor: showHidden ? 'rgba(255,200,0,0.5)' : 'rgba(255,255,255,0.25)',
                    color: showHidden ? '#ffd666' : '#fff'
                  }}
                />
              </Tooltip>
            )}
            <Tooltip title={t('header.import')}>
              <Button
                icon={<ImportOutlined />}
                onClick={() => setImportOpen(true)}
                ghost
                style={{
                  borderRadius: 8,
                  borderColor: 'rgba(255,255,255,0.25)',
                  color: '#fff'
                }}
              />
            </Tooltip>
            <Tooltip title={t('header.refresh')}>
              <Button
                icon={<ReloadOutlined />}
                onClick={refresh}
                loading={loading}
                ghost
                style={{
                  borderRadius: 8,
                  borderColor: 'rgba(255,255,255,0.25)',
                  color: '#fff'
                }}
              />
            </Tooltip>
            <Tooltip title="GitHub">
              <Button
                icon={<GithubOutlined />}
                onClick={() => window.wslAPI.openUrl('https://github.com/modiao2018/WSL-Manager')}
                ghost
                style={{
                  borderRadius: 8,
                  borderColor: 'rgba(255,255,255,0.25)',
                  color: '#fff'
                }}
              />
            </Tooltip>
            <Tooltip title={t('header.settings')}>
              <Button
                icon={<SettingOutlined />}
                onClick={() => setSettingsOpen(true)}
                ghost
                style={{
                  borderRadius: 8,
                  borderColor: 'rgba(255,255,255,0.25)',
                  color: '#fff'
                }}
              />
            </Tooltip>
          </Space>
        </div>

        {/* Content */}
        <Content style={{ padding: 24, maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          <DistroList
            distros={distros}
            loading={loading}
            actionLoading={actionLoading}
            onStart={startDistro}
            onStop={stopDistro}
            onDelete={deleteDistro}
            onClone={cloneDistro}
            onExport={exportDistro}
            hiddenNames={hiddenNames}
            onHide={hideDistro}
            onUnhide={unhideDistro}
          />
        </Content>
      </Layout>

      <ImportDialog
        open={importOpen}
        onOk={async (name, installPath, filePath) => {
          await importDistro(name, installPath, filePath)
          setImportOpen(false)
          message.success(t('importDialog.importSuccess'))
        }}
        onCancel={() => setImportOpen(false)}
      />

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </ConfigProvider>
  )
}
