'use client';

import { Button, Space, Tag, Typography, message } from 'antd';
import { useState } from 'react';
import { deviceBridge } from '../../../../lib/device-bridge';
import { WatchActionButtons, WatchHero, WatchSection } from '../../../../lib/watch-ui';

const { Paragraph } = Typography;

export default function DeviceSettingsFacePage() {
  const [resultText, setResultText] = useState('');
  const [messageApi, contextHolder] = message.useMessage();

  async function handleCheck() {
    const result = await deviceBridge.simulateFaceLogin();
    setResultText(result.message);
    messageApi.success('已完成人脸识别校验');
  }

  return (
    <div className="device-page-stack">
      {contextHolder}
      <WatchHero title="人脸识别" subtitle="用于亮屏后的快捷解锁。" />
      <WatchSection title="识别状态">
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <div className="device-capture-stage" style={{ minHeight: 118 }}>
            <span>人脸</span>
          </div>
          <Space wrap>
            <Tag color="green">支持快捷登录</Tag>
            <Tag color="blue">租赁 / 销售都可用</Tag>
          </Space>
          <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
            {resultText || '识别状态正常。'}
          </Paragraph>
          <Button type="primary" block onClick={() => void handleCheck()}>
            开始识别
          </Button>
        </Space>
      </WatchSection>
      <WatchSection title="功能说明">
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <div className="watch-status-pills">
            <span className="watch-status-pill">快捷解锁</span>
            <span className="watch-status-pill">支持销售/租赁</span>
          </div>
          <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
            录入后可在亮屏时直接完成身份校验。
          </Paragraph>
        </Space>
      </WatchSection>
      <WatchActionButtons primary={{ label: '设置', path: '/settings' }} secondary={{ label: '主屏', path: '/home' }} />
    </div>
  );
}
