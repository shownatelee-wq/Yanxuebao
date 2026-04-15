'use client';

import { AudioOutlined, PictureOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Result, Space, Tag, Typography, message } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { demoMicrochatThreads } from '../../../../lib/device-demo-data';
import { WatchActionButtons } from '../../../../lib/watch-ui';

const { Text } = Typography;

export default function DeviceMicrochatDetailPage() {
  const params = useParams<{ threadId: string }>();
  const [messageApi, contextHolder] = message.useMessage();
  const thread = demoMicrochatThreads.find((item) => item.id === params.threadId);

  if (!thread) {
    return <Result status="404" title="未找到微聊" extra={<Link href="/microchat"><Button>返回微聊</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      {contextHolder}
      <div className="watch-app-view">
      <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space wrap>
            <Tag color="blue">微聊</Tag>
            <Tag color="green">{thread.title}</Tag>
          </Space>
          <p className="device-page-title">{thread.title}</p>
          <div className="watch-status-pills">
            <span className="watch-status-pill">文字</span>
            <span className="watch-status-pill">语音</span>
            <span className="watch-status-pill">图片</span>
          </div>
        </Space>
      </div>

      <div className="watch-list-panel">
        <div className="device-chat-thread">
          {thread.messages.map((item) => (
            <div key={item.id} className={`device-chat-bubble${item.self ? ' self' : ''}`}>
              <Text strong style={{ display: 'block', marginBottom: 4 }}>{item.author}</Text>
              <Text style={{ fontSize: 12 }}>{item.content}</Text>
              <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 10 }}>{item.time}</Text>
            </div>
          ))}
        </div>
      </div>

      <div className="watch-grid-panel">
        <div className="watch-inline-head">
          <span>快捷发送</span>
          <span>语音 / 图片 / 文本</span>
        </div>
        <div className="device-action-chip-row">
          <Button icon={<AudioOutlined />} onClick={() => messageApi.success('已发送 8 秒语音')}>发语音</Button>
          <Button icon={<PictureOutlined />} onClick={() => messageApi.success('已发送 1 张图片')}>发图片</Button>
          <Button icon={<SendOutlined />} onClick={() => messageApi.success('已发送文本消息')}>发文字</Button>
        </div>
      </div>

      <div className="watch-bottom-dock">
        <WatchActionButtons primary={{ label: '聊天', path: '/chat' }} secondary={{ label: '微聊', path: '/microchat' }} />
      </div>
      </div>
    </div>
  );
}
