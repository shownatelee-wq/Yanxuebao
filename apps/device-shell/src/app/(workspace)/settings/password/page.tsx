'use client';

import { Button, Input, Typography, message } from 'antd';
import { useState } from 'react';
import { WatchActionButtons } from '../../../../lib/watch-ui';

const { Paragraph } = Typography;

export default function DeviceSettingsPasswordPage() {
  const [code, setCode] = useState('2580');
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <div className="device-page-stack">
      {contextHolder}
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <p className="device-page-title">锁屏密码</p>
          <div className="watch-status-pills">
            <span className="watch-status-pill">4 位数字</span>
            <span className="watch-status-pill">保护设备</span>
          </div>
        </div>
        <div className="watch-list-panel long-list">
          <Input value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" />
          <Paragraph type="secondary" style={{ margin: '8px 0 0', fontSize: 11 }}>
            锁屏后需要输入密码才能解锁设备。
          </Paragraph>
        </div>
        <div className="watch-bottom-dock">
          <div style={{ marginBottom: 10 }}>
            <Button type="primary" block style={{ height: 42, borderRadius: 15 }} onClick={() => messageApi.success(`锁屏密码 ${code} 已保存`)}>
              保存密码
            </Button>
          </div>
          <WatchActionButtons primary={{ label: '设置', path: '/settings' }} secondary={{ label: '人脸识别', path: '/settings/face' }} />
        </div>
      </div>
    </div>
  );
}
