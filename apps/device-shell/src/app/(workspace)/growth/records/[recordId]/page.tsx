'use client';

import { Button, Result, Space, Tag, Typography } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getGrowthRecordById, useGrowthState } from '../../../../../lib/device-growth-data';

const { Paragraph } = Typography;

export default function DeviceGrowthRecordDetailPage() {
  const params = useParams<{ recordId: string }>();
  const state = useGrowthState();
  const record = getGrowthRecordById(params.recordId, state);

  if (!record) {
    return <Result status="404" title="未找到成长记录" extra={<Link href="/growth"><Button>成长</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <p className="device-page-title">{record.title}</p>
            <div className="watch-status-pills">
              <span className="watch-status-pill">{record.category}</span>
              <span className="watch-status-pill">+{record.delta}</span>
              <span className="watch-status-pill">{record.occurredAt}</span>
            </div>
          </Space>
        </div>

        <div className="watch-list-panel">
          <div className="device-mini-list">
            <div className="device-mini-item watch-list-card">
              <div className="device-mini-item-title">
                <span>记录信息</span>
                <Tag color="blue">{record.displaySource}</Tag>
              </div>
              <Paragraph style={{ margin: 0, fontSize: 12 }}>{record.summary}</Paragraph>
            </div>
            <div className="device-mini-item watch-list-card">
              <div className="device-mini-item-title">
                <span>变化说明</span>
                <Tag color="green">成长值 +{record.delta}</Tag>
              </div>
              <p className="device-mini-item-desc">该记录已同步到成长值明细，并影响当前可用成长值统计。</p>
            </div>
          </div>
        </div>

        <div className="watch-bottom-dock">
          <div className="device-action-row">
            <Link href="/growth/value/details">
              <Button type="primary" block>成长值明细</Button>
            </Link>
            <Link href="/growth/value">
              <Button block>成长值</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
