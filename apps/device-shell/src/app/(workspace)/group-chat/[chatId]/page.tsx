'use client';

import { AudioOutlined, EnvironmentOutlined, LinkOutlined, PictureOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Result, Space, Tag, Typography, message } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { appendGroupChatMessage, useDeviceSocialSnapshot } from '../../../../lib/device-social-state';
import { WatchActionButtons } from '../../../../lib/watch-ui';

const { Text } = Typography;

export default function DeviceGroupChatDetailPage() {
  const params = useParams<{ chatId: string }>();
  const [messageApi, contextHolder] = message.useMessage();
  const { groupChats } = useDeviceSocialSnapshot();
  const chat = groupChats.find((item) => item.id === params.chatId);

  if (!chat) {
    return <Result status="404" title="未找到群聊" extra={<Link href="/group-chat"><Button>返回群聊</Button></Link>} />;
  }

  const safeChat = chat;

  function sendCard(kind: 'location' | 'media' | 'ai' | 'meeting' | 'task') {
    const map = {
      location: { type: 'location' as const, content: '我在海豚馆主池边', cardTitle: '位置', cardSummary: '海豚馆主池边' },
      media: { type: 'image' as const, content: '已发送 2 张观察图片', cardTitle: '图片/视频', cardSummary: '海豚观察素材' },
      ai: { type: 'ai_record' as const, content: 'AI探究记录卡', cardTitle: 'AI探究记录卡', cardSummary: '海豚结队活动分析', path: '/identify/identify_record_album_01' },
      meeting: { type: 'meeting_summary' as const, content: '会议纪要卡', cardTitle: '会议纪要卡', cardSummary: '海豚观察碰头会', path: '/meeting/meeting_01/summary' },
      task: { type: 'task_invite' as const, content: '任务挑战邀请', cardTitle: '任务挑战邀请', cardSummary: '一起完成生态设施大搜索', path: '/tasks' },
    }[kind];

    appendGroupChatMessage(safeChat.id, { ...map, author: '我', self: true });
    messageApi.success('已发送到群聊');
  }

  return (
    <div className="device-page-stack">
      {contextHolder}
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Space wrap>
              <Tag color="purple">{safeChat.badge}</Tag>
              <Tag color="blue">{safeChat.members.length} 人</Tag>
            </Space>
            <p className="device-page-title">{safeChat.title}</p>
            <div className="watch-status-pills">
              <span className="watch-status-pill">位置</span>
              <span className="watch-status-pill">AI记录</span>
              <span className="watch-status-pill">邀请卡</span>
            </div>
          </Space>
        </div>

        <div className="watch-list-panel">
          <div className="device-chat-thread">
            {safeChat.messages.map((item) => (
              <div key={item.id} className={`device-chat-bubble${item.self ? ' self' : ''}`}>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>{item.author}</Text>
                {item.cardTitle ? (
                  <Link href={item.path ?? '#'} className="device-card-link">
                    <div className="device-chat-card-message">
                      <strong>{item.cardTitle}</strong>
                      <span>{item.cardSummary ?? item.content}</span>
                    </div>
                  </Link>
                ) : (
                  <Text style={{ fontSize: 12 }}>{item.content}</Text>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="watch-grid-panel">
          <div className="device-action-chip-row">
            <Button icon={<AudioOutlined />} onClick={() => messageApi.success('已发送群语音')}>语音</Button>
            <Button icon={<EnvironmentOutlined />} onClick={() => sendCard('location')}>位置</Button>
            <Button icon={<PictureOutlined />} onClick={() => sendCard('media')}>图片/视频</Button>
            <Button icon={<LinkOutlined />} onClick={() => sendCard('ai')}>AI探究</Button>
            <Button icon={<SendOutlined />} onClick={() => sendCard('task')}>挑战邀请</Button>
          </div>
        </div>

        <div className="watch-bottom-dock">
          <WatchActionButtons primary={{ label: '去会议', path: '/meeting' }} secondary={{ label: '返回群聊', path: '/group-chat' }} />
        </div>
      </div>
    </div>
  );
}
