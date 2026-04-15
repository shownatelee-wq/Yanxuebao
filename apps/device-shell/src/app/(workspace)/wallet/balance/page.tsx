'use client';

import { Space, Tag, Typography } from 'antd';
import { WatchActionButtons } from '../../../../lib/watch-ui';

const { Paragraph } = Typography;

export default function DeviceWalletBalancePage() {
  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <p className="device-page-title">余额</p>
          <div className="watch-status-pills">
            <span className="watch-status-pill">82.10 元</span>
            <span className="watch-status-pill">今日消费 27.90</span>
          </div>
        </div>
        <div className="watch-list-panel long-list">
          <div className="device-balance-card">
            <strong>82.10 元</strong>
            <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
              最近一次充值 +50.00 元
            </Paragraph>
            <Space wrap>
              <Tag color="green">亲子卡正常</Tag>
              <Tag color="blue">余额充足</Tag>
            </Space>
          </div>
        </div>
        <div className="watch-bottom-dock">
          <WatchActionButtons primary={{ label: '交易记录', path: '/wallet/records' }} secondary={{ label: '支付', path: '/wallet' }} />
        </div>
      </div>
    </div>
  );
}
