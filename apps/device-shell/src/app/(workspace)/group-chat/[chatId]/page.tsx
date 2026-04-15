'use client';

import { AudioOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Result, Space, Tag, Typography, message } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { demoGroupChats } from '../../../../lib/device-demo-data';
import { WatchActionButtons } from '../../../../lib/watch-ui';

const { Text } = Typography;

export default function DeviceGroupChatDetailPage() {
  const params = useParams<{ chatId: string }>();
  const [messageApi, contextHolder] = message.useMessage();
  const chat = demoGroupChats.find((item) => item.id === params.chatId);

  if (!chat) {
    return <Result status="404" title="未找到群聊" extra={<Link href="/group-chat"><Button>返回群聊</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      {contextHolder}
      <div className="watch-app-view">
      <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space wrap>
            <Tag color="purple">{chat.badge}</Tag>
            <Tag color="blue">{chat.members.length} 人</Tag>
          </Space>
          <p className="device-page-title">{chat.title}</p>
          <div className="watch-status-pills">
            <span className="watch-status-pill">{chat.badge}</span>
            <span className="watch-status-pill">{chat.members.length} 人</span>
          </div>
        </Space>
      </div>

      <div className="watch-list-panel">
        <div className="device-chat-thread">
          {chat.messages.map((item) => (
            <div key={item.id} className={`device-chat-bubble${item.self ? ' self' : ''}`}>
              <Text strong style={{ display: 'block', marginBottom: 4 }}>{item.author}</Text>
              <Text style={{ fontSize: 12 }}>{item.content}</Text>
            </div>
          ))}
        </div>
      </div>

      <div className="watch-grid-panel">
        <div className="device-action-chip-row">
          <Button icon={<AudioOutlined />} onClick={() => messageApi.success('已发送群语音')}>发语音</Button>
          <Button icon={<SendOutlined />} onClick={() => messageApi.success('已发送任务卡片')}>发任务卡</Button>
        </div>
      </div>

      <div className="watch-bottom-dock">
        <WatchActionButtons primary={{ label: '去会议', path: '/meeting' }} secondary={{ label: '返回群聊', path: '/group-chat' }} />
      </div>
      </div>
    </div>
  );
}
