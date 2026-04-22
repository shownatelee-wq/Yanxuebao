'use client';

import { Button, Space, Tag, Typography, message } from 'antd';
import Link from 'next/link';
import { approveFriendRequest, rejectFriendRequest, useDeviceSocialSnapshot } from '../../../lib/device-social-state';

const { Paragraph } = Typography;

export default function DeviceFriendsPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const { friends, microchatThreads } = useDeviceSocialSnapshot();
  const pendingFriends = friends.filter((friend) => friend.verificationStatus === 'pending');
  const visibleFriends = friends.filter((friend) => friend.verificationStatus !== 'pending');

  return (
    <div className="device-page-stack">
      {contextHolder}
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <p className="device-page-title">好友</p>
              <Link href="/friends/new">
                <Button type="link">
                  添加好友
                </Button>
              </Link>
            </Space>
            <div className="watch-status-pills">
              <span className="watch-status-pill">{visibleFriends.length} 位联系人</span>
              <span className="watch-status-pill">{visibleFriends.filter((item) => item.unread).length} 个未读</span>
              <span className="watch-status-pill">{pendingFriends.length} 个待验证</span>
            </div>
          </Space>
        </div>

        <div className="watch-list-panel">
          {pendingFriends.length ? (
            <div className="device-new-friend-panel">
              <p className="device-section-label">新的朋友</p>
              <div className="device-mini-list">
                {pendingFriends.map((friend) => (
                  <div key={friend.id} className="device-mini-item watch-list-card">
                    <div className="device-mini-item-title">
                      <span>{friend.name}</span>
                      <Tag color="gold">{friend.relation}</Tag>
                    </div>
                    <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
                      ID {friend.yxbId} · {friend.mobile} · {friend.note}
                    </Paragraph>
                    <div className="device-action-row" style={{ marginTop: 10 }}>
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => {
                          approveFriendRequest(friend.id);
                          messageApi.success('已通过好友申请');
                        }}
                      >
                        通过
                      </Button>
                      <Button
                        size="small"
                        onClick={() => {
                          rejectFriendRequest(friend.id);
                          messageApi.success('已拒绝好友申请');
                        }}
                      >
                        拒绝
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <div className="device-mini-list">
            {visibleFriends.map((friend) => {
              const thread = microchatThreads.find((item) => item.friendId === friend.id);
              return (
                <div key={friend.id} className="device-mini-item watch-list-card">
                  <div className="device-mini-item-title">
                    <span>{friend.name}</span>
                    <Space size={6}>
                      <Tag color={friend.status === 'online' ? 'green' : 'default'}>
                        {friend.status === 'online' ? '在线' : '离线'}
                      </Tag>
                      {friend.isBlocked ? <Tag color="red">已拉黑</Tag> : null}
                      {friend.unread ? <Tag color="red">{friend.unread}</Tag> : null}
                    </Space>
                  </div>
                  <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
                    {friend.relation} · ID {friend.yxbId} · {friend.note}
                  </Paragraph>
                  <div className="device-action-chip-row" style={{ marginTop: 10 }}>
                    <Link href={`/friends/${friend.id}`}>
                      <Button size="small" type="primary">详情</Button>
                    </Link>
                    {thread && !friend.isBlocked ? (
                      <Link href={`/microchat/${thread.id}`}>
                        <Button size="small">微聊</Button>
                      </Link>
                    ) : (
                      <Button size="small" disabled>微聊</Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
