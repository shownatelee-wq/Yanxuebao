'use client';

import { Space, Tag } from 'antd';
import { WatchActionButtons, WatchInfoRow } from '../../../../lib/watch-ui';

export default function DeviceWalletCardPage() {
  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <p className="device-page-title">支付卡绑定</p>
          <div className="watch-status-pills">
            <span className="watch-status-pill">支付宝亲子卡</span>
            <span className="watch-status-pill">已授权</span>
          </div>
        </div>
        <div className="watch-list-panel long-list">
          <div className="watch-inline-head">
            <span>卡片信息</span>
            <span>亲子卡 / 限额</span>
          </div>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <WatchInfoRow label="当前卡片" value="支付宝亲子卡 · 尾号 2458" />
            <WatchInfoRow label="每日限额" value="50 元" />
            <WatchInfoRow label="支付范围" value="支付码消费 / 课程购买" />
            <Tag color="green">已授权付款码支付</Tag>
          </Space>
        </div>
        <div className="watch-bottom-dock">
          <WatchActionButtons primary={{ label: '付款码', path: '/wallet/code' }} secondary={{ label: '支付', path: '/wallet' }} />
        </div>
      </div>
    </div>
  );
}
