'use client';

import { Space, Tag, Typography } from 'antd';
import { demoWalletRecords } from '../../../../lib/device-demo-data';
import { WatchActionButtons } from '../../../../lib/watch-ui';

const { Paragraph } = Typography;

export default function DeviceWalletRecordsPage() {
  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <p className="device-page-title">交易记录</p>
          <div className="watch-status-pills">
            <span className="watch-status-pill">{demoWalletRecords.length} 条记录</span>
            <span className="watch-status-pill">消费 / 充值</span>
          </div>
        </div>
        <div className="watch-list-panel long-list">
          <div className="device-mini-list">
            {demoWalletRecords.map((record) => (
              <div key={record.id} className="device-mini-item watch-list-card">
                <div className="device-mini-item-title">
                  <span>{record.title}</span>
                  <Space size={6}>
                    <Tag color={record.amount.startsWith('+') ? 'green' : 'blue'}>{record.amount}</Tag>
                    <Tag color="default">{record.status}</Tag>
                  </Space>
                </div>
                <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
                  {record.createdAt}
                </Paragraph>
              </div>
            ))}
          </div>
        </div>
        <div className="watch-bottom-dock">
          <WatchActionButtons primary={{ label: '付款码', path: '/wallet/code' }} secondary={{ label: '支付', path: '/wallet' }} />
        </div>
      </div>
    </div>
  );
}
