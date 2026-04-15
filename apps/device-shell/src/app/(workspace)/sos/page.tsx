'use client';

import { Button, Space, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { deviceBridge } from '../../../lib/device-bridge';
import { demoSosFlow } from '../../../lib/device-demo-data';
import { WatchHero, WatchSection, WatchActionButtons, WatchInfoRow } from '../../../lib/watch-ui';

const { Paragraph } = Typography;

export default function DeviceSosPage() {
  const [loading, setLoading] = useState(false);
  const [locationText, setLocationText] = useState('');
  const [phase, setPhase] = useState<'ready' | 'recording' | 'confirm' | 'sent'>('ready');
  const [countdown, setCountdown] = useState(demoSosFlow.recordingSeconds);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (phase !== 'recording') {
      return;
    }
    if (countdown <= 0) {
      setPhase('confirm');
      return;
    }
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown, phase]);

  async function handleSos() {
    try {
      setLoading(true);
      const result = await deviceBridge.requestSosLocation();
      setLocationText(`${result.latitude}, ${result.longitude} · 精度约 ${result.accuracy} 米`);
      setCountdown(demoSosFlow.recordingSeconds);
      setPhase('recording');
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '发送 SoS 失败');
    } finally {
      setLoading(false);
    }
  }

  function completeSend(mode: '自动发送' | '手动发送') {
    setPhase('sent');
    messageApi.success(`${mode}已完成，求助信息已发送`);
  }

  return (
    <div className="device-page-stack">
      {contextHolder}
      <WatchHero
        title="SoS"
        subtitle="同时按住拍照键和说话键即可触发求助。"
        tags={[
          { label: '紧急求助', color: 'red' },
          { label: '定位已就绪', color: 'blue' },
        ]}
      />
      <WatchSection title="求助状态">
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <WatchInfoRow label="求助对象" value={demoSosFlow.recipients.join(' + ')} />
          <WatchInfoRow label="当前坐标" value={locationText || '定位待获取'} />
          <WatchInfoRow label="录音时长" value={`${demoSosFlow.recordingSeconds} 秒`} />
          <WatchInfoRow
            label="当前状态"
            value={
              phase === 'ready'
                ? '告警准备中'
                : phase === 'recording'
                  ? `自动录音中 ${countdown}s`
                  : phase === 'confirm'
                    ? '等待发送确认'
                    : '已发送'
            }
          />
          <Tag color="red">会附带定位和 10 秒现场录音</Tag>
        </Space>
      </WatchSection>
      <WatchSection title="求助状态">
        {phase === 'ready' ? (
          <>
            <Button danger type="primary" loading={loading} block onClick={() => void handleSos()}>
              开始求助
            </Button>
            <Paragraph type="secondary" style={{ margin: '8px 0 0', fontSize: 11 }}>
              自动录音 10 秒后进入发送状态。
            </Paragraph>
          </>
        ) : null}
        {phase === 'recording' ? (
          <>
            <Button danger type="primary" block disabled>
              自动录音中 {countdown}s
            </Button>
            <Paragraph type="secondary" style={{ margin: '8px 0 0', fontSize: 11 }}>
              正在整理定位和录音内容。
            </Paragraph>
          </>
        ) : null}
        {phase === 'confirm' ? (
          <>
            <div className="device-action-row">
              <Button danger type="primary" block onClick={() => completeSend('自动发送')}>
                自动发送
              </Button>
              <Button block onClick={() => completeSend('手动发送')}>
                手动发送
              </Button>
            </div>
            <Paragraph type="secondary" style={{ margin: '8px 0 0', fontSize: 11 }}>
              可自动发送，也可手动确认发送。
            </Paragraph>
          </>
        ) : null}
        {phase === 'sent' ? (
          <Paragraph style={{ margin: 0, fontSize: 12 }}>
            求助信息已发送，定位、录音和求助状态会同步给家长与导师。
          </Paragraph>
        ) : null}
      </WatchSection>
      <WatchActionButtons primary={{ label: '消息', path: '/messages' }} secondary={{ label: '主屏', path: '/home' }} />
    </div>
  );
}
