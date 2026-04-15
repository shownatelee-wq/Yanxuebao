'use client';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Space, Tag, Typography } from 'antd';
import Link from 'next/link';
import { demoFriends } from '../../../lib/device-demo-data';
import { WatchActionButtons } from '../../../lib/watch-ui';

const { Paragraph } = Typography;

export default function DeviceFriendsPage() {
  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <p className="device-page-title">好友</p>
              <Link href="/friends/new">
                <Button type="link" icon={<PlusOutlined />}>
                  新建
                </Button>
              </Link>
            </Space>
            <div className="watch-status-pills">
              <span className="watch-status-pill">{demoFriends.length} 位联系人</span>
              <span className="watch-status-pill">{demoFriends.filter((item) => item.unread).length} 个未读</span>
            </div>
          </Space>
        </div>

        <div className="watch-list-panel">
          <div className="device-mini-list">
            {demoFriends.map((friend) => (
              <Link key={friend.id} href={`/friends/${friend.id}`} className="device-card-link">
                <div className="device-mini-item watch-list-card">
                  <div className="device-mini-item-title">
                    <span>{friend.name}</span>
                    <Space size={6}>
                      <Tag color={friend.status === 'online' ? 'green' : 'default'}>
                        {friend.status === 'online' ? '在线' : '离线'}
                      </Tag>
                      {friend.unread ? <Tag color="red">{friend.unread}</Tag> : null}
                    </Space>
                  </div>
                  <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
                    {friend.relation} · {friend.note}
                  </Paragraph>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="watch-bottom-dock">
          <WatchActionButtons primary={{ label: '微聊', path: '/microchat' }} secondary={{ label: '群聊', path: '/group-chat' }} />
        </div>
      </div>
    </div>
  );
}
