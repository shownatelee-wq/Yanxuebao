'use client';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Space, Tag, Typography } from 'antd';
import Link from 'next/link';
import { useDeviceSocialSnapshot } from '../../../lib/device-social-state';
import { WatchActionButtons } from '../../../lib/watch-ui';

const { Paragraph } = Typography;

export default function DeviceGroupChatPage() {
  const { groupChats } = useDeviceSocialSnapshot();

  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <p className="device-page-title">群聊</p>
              <Link href="/group-chat/new">
                <Button type="link" icon={<PlusOutlined />}>
                  新建
                </Button>
              </Link>
            </Space>
            <div className="watch-status-pills">
              <span className="watch-status-pill">{groupChats.length} 个群</span>
              <span className="watch-status-pill">
                {groupChats.reduce((sum, chat) => sum + (chat.unread ?? 0), 0)} 条未读
              </span>
            </div>
          </Space>
        </div>
        <div className="watch-list-panel">
          <div className="device-mini-list">
            {groupChats.map((chat) => (
              <Link key={chat.id} href={`/group-chat/${chat.id}`} className="device-card-link">
                <div className="device-mini-item watch-list-card">
                  <div className="device-mini-item-title">
                    <span>{chat.title}</span>
                    <Space size={6}>
                      <Tag color="purple">{chat.badge}</Tag>
                      {chat.unread ? <Tag color="red">{chat.unread}</Tag> : null}
                    </Space>
                  </div>
                  <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
                    {chat.messages[chat.messages.length - 1]?.content}
                  </Paragraph>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="watch-bottom-dock">
          <WatchActionButtons primary={{ label: '新建群聊', path: '/group-chat/new' }} secondary={{ label: '好友', path: '/friends' }} />
        </div>
      </div>
    </div>
  );
}
