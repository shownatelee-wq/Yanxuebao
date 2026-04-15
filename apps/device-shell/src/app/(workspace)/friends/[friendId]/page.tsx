'use client';

import { Button, Result, Space } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { demoFriends, demoMicrochatThreads } from '../../../../lib/device-demo-data';
import { WatchActionButtons, WatchInfoRow } from '../../../../lib/watch-ui';

export default function DeviceFriendDetailPage() {
  const params = useParams<{ friendId: string }>();
  const friend = demoFriends.find((item) => item.id === params.friendId);
  const thread = demoMicrochatThreads.find((item) => item.friendId === params.friendId);

  if (!friend) {
    return <Result status="404" title="未找到好友" extra={<Link href="/friends"><Button>好友</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <p className="device-page-title">{friend.name}</p>
            <div className="watch-status-pills">
              <span className="watch-status-pill">{friend.relation}</span>
              <span className="watch-status-pill">{friend.status === 'online' ? '在线' : '离线'}</span>
              <span className="watch-status-pill">{friend.unread ?? 0} 条未读</span>
            </div>
          </Space>
        </div>

        <div className="watch-list-panel long-list">
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <WatchInfoRow label="最近状态" value={friend.status === 'online' ? '在线' : '暂时离线'} />
            <WatchInfoRow label="联系人备注" value={friend.note} />
            <WatchInfoRow label="会话状态" value={thread ? '已有微聊会话' : '可新建会话'} />
          </Space>
        </div>

        <div className="watch-bottom-dock">
          <WatchActionButtons
            primary={{ label: '微聊', path: thread ? `/microchat/${thread.id}` : '/microchat' }}
            secondary={{ label: '建群聊', path: '/group-chat/new' }}
          />
        </div>
      </div>
    </div>
  );
}
