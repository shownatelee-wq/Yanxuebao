'use client';

import { Tag, Typography } from 'antd';
import Link from 'next/link';
import { demoWalletRecords } from '../../../lib/device-demo-data';
import { WatchActionButtons } from '../../../lib/watch-ui';

const { Paragraph } = Typography;

export default function DeviceWalletPage() {
  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <p className="device-page-title">支付</p>
          <div className="watch-status-pills">
            <span className="watch-status-pill">余额 82.10</span>
            <span className="watch-status-pill">亲子卡已授权</span>
          </div>
        </div>

        <div className="watch-grid-panel long-grid">
          <div className="watch-inline-head">
            <span>支付入口</span>
            <span>扫码 / 余额 / 卡管理</span>
          </div>
          <div className="device-plaza-grid">
            <Link href="/wallet/code" className="device-plaza-tile">
              <strong style={{ fontSize: 12 }}>付款码</strong>
              <span className="device-mini-item-desc">到店扫码</span>
            </Link>
            <Link href="/wallet/balance" className="device-plaza-tile">
              <strong style={{ fontSize: 12 }}>余额</strong>
              <span className="device-mini-item-desc">查看金额</span>
            </Link>
            <Link href="/wallet/records" className="device-plaza-tile">
              <strong style={{ fontSize: 12 }}>交易记录</strong>
              <span className="device-mini-item-desc">消费与充值</span>
            </Link>
            <Link href="/wallet/card" className="device-plaza-tile">
              <strong style={{ fontSize: 12 }}>支付卡绑定</strong>
              <span className="device-mini-item-desc">查看亲子卡</span>
            </Link>
          </div>
        </div>

        <div className="watch-list-panel long-list">
          <div className="watch-inline-head">
            <span>最近交易</span>
            <span>消费 / 充值</span>
          </div>
          <div className="device-mini-list">
            {demoWalletRecords.slice(0, 2).map((record) => (
              <div key={record.id} className="device-mini-item watch-list-card">
                <div className="device-mini-item-title">
                  <span>{record.title}</span>
                  <Tag color={record.amount.startsWith('+') ? 'green' : 'blue'}>{record.amount}</Tag>
                </div>
                <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
                  {record.createdAt} · {record.status}
                </Paragraph>
              </div>
            ))}
          </div>
        </div>

        <div className="watch-bottom-dock">
          <WatchActionButtons primary={{ label: '付款码', path: '/wallet/code' }} secondary={{ label: '支付卡', path: '/wallet/card' }} />
        </div>
      </div>
    </div>
  );
}
