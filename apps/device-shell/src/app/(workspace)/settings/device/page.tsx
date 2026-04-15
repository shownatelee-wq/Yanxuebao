'use client';

import { Space, Tag } from 'antd';
import { WatchActionButtons, WatchInfoRow } from '../../../../lib/watch-ui';

export default function DeviceSettingsDevicePage() {
  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <p className="device-page-title">设备绑定</p>
          <div className="watch-status-pills">
            <span className="watch-status-pill">YXB-DEV-0001</span>
            <span className="watch-status-pill">租赁模式</span>
          </div>
        </div>
        <div className="watch-list-panel long-list">
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <WatchInfoRow label="设备码" value="YXB-DEV-0001" />
            <WatchInfoRow label="绑定学员" value="李同学" />
            <WatchInfoRow label="绑定家长" value="妈妈" />
            <Tag color="blue">租赁模式可切授权码登录</Tag>
          </Space>
        </div>
        <div className="watch-bottom-dock">
          <WatchActionButtons primary={{ label: '锁屏密码', path: '/settings/password' }} secondary={{ label: '设置', path: '/settings' }} />
        </div>
      </div>
    </div>
  );
}
