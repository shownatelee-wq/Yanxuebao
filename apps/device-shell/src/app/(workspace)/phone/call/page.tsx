'use client';

import { AudioOutlined, PhoneOutlined } from '@ant-design/icons';
import { Button, Result, Space, Tag } from 'antd';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getFriendById } from '../../../../lib/device-social-state';

function formatDuration(seconds: number) {
  const min = Math.floor(seconds / 60).toString().padStart(2, '0');
  const sec = (seconds % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}

export default function DevicePhoneCallPage() {
  const searchParams = useSearchParams();
  const friend = getFriendById(searchParams.get('friendId') ?? '');
  const [seconds, setSeconds] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const connectTimer = window.setTimeout(() => setConnected(true), 900);
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => {
      window.clearTimeout(connectTimer);
      window.clearInterval(timer);
    };
  }, []);

  if (!friend) {
    return <Result status="404" title="未找到联系人" extra={<Link href="/friends"><Button>返回好友</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      <div className="device-phone-call-screen">
        <div className="device-phone-avatar">
          <PhoneOutlined />
        </div>
        <Space direction="vertical" size={8} style={{ width: '100%', alignItems: 'center' }}>
          <Tag color={connected ? 'green' : 'blue'}>{connected ? '通话中' : '正在拨打'}</Tag>
          <p className="device-page-title">{friend.name}</p>
          <p className="device-page-subtle">{friend.mobile} · ID {friend.yxbId}</p>
          <strong className="device-phone-duration">{connected ? formatDuration(seconds) : '等待接听...'}</strong>
        </Space>
        <div className="device-action-row">
          <Button icon={<AudioOutlined />} block>静音</Button>
          <Link href={`/friends/${friend.id}`}>
            <Button type="primary" danger block>挂断</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
