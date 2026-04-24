import { Spin, Empty, Row, Col } from 'antd'
import { LinuxOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import type { WslDistro } from '../types'
import { DistroCard } from './DistroCard'

interface DistroListProps {
  distros: WslDistro[]
  loading: boolean
  actionLoading: Record<string, boolean>
  onStart: (name: string) => Promise<void>
  onStop: (name: string) => Promise<void>
  onDelete: (name: string) => Promise<void>
  onClone: (source: string, newName: string, installPath: string) => Promise<void>
  onExport: (name: string, filePath: string) => Promise<void>
  hiddenNames: string[]
  onHide: (name: string) => void
  onUnhide: (name: string) => void
}

export function DistroList({
  distros,
  loading,
  actionLoading,
  onStart,
  onStop,
  onDelete,
  onClone,
  onExport,
  hiddenNames,
  onHide,
  onUnhide
}: DistroListProps) {
  const { t } = useTranslation()

  if (loading && distros.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, color: '#8c8c8c', fontSize: 14 }}>
          {t('distroList.loading')}
        </div>
      </div>
    )
  }

  if (distros.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <LinuxOutlined style={{ fontSize: 56, color: '#d9d9d9' }} />
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span style={{ color: '#8c8c8c', fontSize: 14 }}>
              {t('distroList.empty')}
            </span>
          }
          style={{ marginTop: 12 }}
        />
      </div>
    )
  }

  return (
    <Row gutter={[16, 16]}>
      {distros.map((d) => (
        <Col key={d.name} xs={24} sm={12} md={8} lg={8} xl={6} xxl={6}>
          <DistroCard
            distro={d}
            actionLoading={actionLoading}
            onStart={onStart}
            onStop={onStop}
            onDelete={onDelete}
            onClone={onClone}
            onExport={onExport}
            onHide={onHide}
            onUnhide={onUnhide}
            isHidden={hiddenNames.includes(d.name)}
          />
        </Col>
      ))}
    </Row>
  )
}
