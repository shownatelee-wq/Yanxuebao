'use client';

import { Space, Tag } from 'antd';
import { WatchActionButtons } from '../../../../lib/watch-ui';

export default function DeviceWalletCodePage() {
  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <p className="device-page-title">付款码</p>
          <div className="watch-status-pills">
            <span className="watch-status-pill">已授权</span>
            <span className="watch-status-pill">单次限额 50 元</span>
          </div>
        </div>
        <div className="watch-list-panel long-list">
          <div className="device-qr-card">
            <div className="device-qr-box" />
            <Space wrap>
              <Tag color="green">支付宝亲子卡</Tag>
              <Tag color="blue">到店扫码</Tag>
            </Space>
          </div>
        </div>
        <div className="watch-bottom-dock">
          <WatchActionButtons primary={{ label: '支付', path: '/wallet' }} secondary={{ label: '交易记录', path: '/wallet/records' }} />
        </div>
      </div>
    </div>
  );
}
