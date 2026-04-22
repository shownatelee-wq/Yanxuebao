'use client';

import { PhoneOutlined } from '@ant-design/icons';
import { Button, Input, Result, Space, message } from 'antd';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  deleteFriend,
  setFriendBlocked,
  updateFriendRemark,
  useDeviceSocialSnapshot,
} from '../../../../lib/device-social-state';
import { WatchInfoRow } from '../../../../lib/watch-ui';

export default function DeviceFriendDetailPage() {
  const params = useParams<{ friendId: string }>();
  const router = useRouter();
  const { friends, microchatThreads } = useDeviceSocialSnapshot();
  const [messageApi, contextHolder] = message.useMessage();
  const friend = friends.find((item) => item.id === params.friendId);
  const thread = microchatThreads.find((item) => item.friendId === params.friendId);
  const [remark, setRemark] = useState(friend?.remark ?? '');

  if (!friend) {
    return <Result status="404" title="未找到好友" extra={<Link href="/friends"><Button>好友</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      {contextHolder}
      <div className="watch-app-view">
        <div className="device-hero-card device-stage-card watch-system-hero" style={{ padding: 12 }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <div className="device-friend-name-row">
              <p className="device-page-title">{friend.name}</p>
              <Link href={`/phone/call?friendId=${friend.id}`} aria-label={`拨打${friend.name}`}>
                <Button type="primary" shape="circle" icon={<PhoneOutlined />} disabled={friend.isBlocked} />
              </Link>
            </div>
            <div className="watch-status-pills">
              <span className="watch-status-pill">{friend.relation}</span>
              <span className="watch-status-pill">ID {friend.yxbId}</span>
              <span className="watch-status-pill">{friend.status === 'online' ? '在线' : '离线'}</span>
              {friend.isBlocked ? <span className="watch-status-pill">已拉黑</span> : null}
            </div>
          </Space>
        </div>

        <div className="watch-list-panel long-list">
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <WatchInfoRow label="研学宝ID" value={friend.yxbId} />
            <WatchInfoRow label="手机号" value={friend.mobile} />
            <WatchInfoRow label="验证状态" value={friend.verificationStatus === 'verified' ? '已验证' : friend.verificationStatus === 'blocked' ? '已拉黑' : '待验证'} />
            <WatchInfoRow label="会话状态" value={thread ? '已有微聊会话' : '可新建会话'} />
          </Space>
        </div>

        <div className="watch-list-panel long-list">
          <p className="device-section-label">好友备注</p>
          <Input value={remark} onChange={(event) => setRemark(event.target.value)} placeholder="添加备注" />
          <Button
            block
            style={{ marginTop: 10 }}
            onClick={() => {
              updateFriendRemark(friend.id, remark);
              messageApi.success('备注已保存');
            }}
          >
            保存备注
          </Button>
        </div>

        <div className="watch-bottom-dock">
          <div className="device-action-row">
            <Button
              danger
              block
              onClick={() => {
                deleteFriend(friend.id);
                messageApi.success('好友已删除');
                router.replace('/friends');
              }}
            >
              删除
            </Button>
            <Button
              block
              danger={!friend.isBlocked}
              onClick={() => {
                setFriendBlocked(friend.id, !friend.isBlocked);
                messageApi.success(friend.isBlocked ? '已移出黑名单' : '已加入黑名单');
              }}
            >
              {friend.isBlocked ? '移出黑名单' : '拉黑'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
