'use client';

import { Button, Space, Tag } from 'antd';
import { useState } from 'react';
import { deviceIdentityProfile } from '../../../../lib/device-workspace-state';
import { WatchActionButtons, WatchInfoRow } from '../../../../lib/watch-ui';

export default function DeviceSettingsDevicePage() {
  const [qrVisible, setQrVisible] = useState(false);

  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <p className="device-page-title">设备绑定</p>
          <div className="watch-status-pills">
            <span className="watch-status-pill">{deviceIdentityProfile.deviceId}</span>
            <span className="watch-status-pill">租赁模式</span>
          </div>
        </div>
        <div className="watch-list-panel long-list">
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <WatchInfoRow label="设备唯一ID" value={deviceIdentityProfile.deviceId} />
            <WatchInfoRow label="研学宝ID" value={deviceIdentityProfile.yxbId} />
            <WatchInfoRow label="手机号" value={deviceIdentityProfile.mobile} />
            <WatchInfoRow label="绑定学员" value={deviceIdentityProfile.studentName} />
            <WatchInfoRow label="绑定家长" value={deviceIdentityProfile.parentName} />
            <Tag color="blue">租赁模式可切授权码登录</Tag>
            <Button type="primary" block onClick={() => setQrVisible((visible) => !visible)}>
              {qrVisible ? '收起设备二维码' : '查看设备二维码'}
            </Button>
          </Space>
        </div>
        {qrVisible ? (
          <div className="watch-list-panel long-list">
            <div className="device-qr-card">
              <div className="device-qr-box" />
              <Tag color="green">家长扫码绑定：{deviceIdentityProfile.deviceId}</Tag>
              <p className="device-mini-item-desc" style={{ margin: 0 }}>
                二维码内容：{deviceIdentityProfile.deviceId} / {deviceIdentityProfile.yxbId}
              </p>
            </div>
          </div>
        ) : null}
        <div className="watch-bottom-dock">
          <WatchActionButtons primary={{ label: '锁屏密码', path: '/settings/password' }} secondary={{ label: '设置', path: '/settings' }} />
        </div>
      </div>
    </div>
  );
}
