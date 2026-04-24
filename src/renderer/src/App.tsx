import { useState } from 'react'
import { ConfigProvider, Layout, Button, Space, Typography, message, theme } from 'antd'
import logoIcon from './assets/icon.png'
import { ReloadOutlined, ImportOutlined, EyeOutlined, EyeInvisibleOutlined, GlobalOutlined } from '@ant-design/icons'
import zhCN from 'antd/locale/zh_CN'
import enUS from 'antd/locale/en_US'
import { useTranslation } from 'react-i18next'
import { setLanguage } from './i18n'
import { useWsl } from './hooks/useWsl'
import { DistroList } from './components/DistroList'
import { ImportDialog } from './components/ImportDialog'
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
  const { t, i18n } = useTranslation()

  const runningCount = distros.filter((d) => d.state === 'Running').length
  const isZh = i18n.language.startsWith('zh')
  const antdLocale = isZh ? zhCN : enUS

  const toggleLang = () => {
    setLanguage(isZh ? 'en' : 'zh')
  }

  return (
    <ConfigProvider
      locale={antdLocale}
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
              <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>
                WSL Manager
              </div>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                {t('header.stats', { total: distros.length, running: runningCount })}
              </Text>
            </div>
          </div>
          {/* @ts-expect-error electron css property */}
          <Space style={{ WebkitAppRegion: 'no-drag' }}>
            {hiddenCount > 0 && (
              <Button
                icon={showHidden ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                onClick={toggleShowHidden}
                ghost
                style={{
                  borderRadius: 8,
                  borderColor: showHidden ? 'rgba(255,200,0,0.5)' : 'rgba(255,255,255,0.25)',
                  color: showHidden ? '#ffd666' : '#fff'
                }}
              >
                {showHidden ? t('header.hiddenShown') : t('header.hiddenCount', { count: hiddenCount })}
              </Button>
            )}
            <Button
              icon={<ImportOutlined />}
              onClick={() => setImportOpen(true)}
              ghost
              style={{
                borderRadius: 8,
                borderColor: 'rgba(255,255,255,0.25)',
                color: '#fff'
              }}
            >
              {t('header.import')}
            </Button>
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
            >
              {t('header.refresh')}
            </Button>
            <Button
              icon={<GlobalOutlined />}
              onClick={toggleLang}
              ghost
              style={{
                borderRadius: 8,
                borderColor: 'rgba(255,255,255,0.25)',
                color: '#fff',
                minWidth: 40
              }}
            >
              {isZh ? 'EN' : '中文'}
            </Button>
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
    </ConfigProvider>
  )
}
