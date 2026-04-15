'use client';

import { Button, Result, Space, Tag, Typography } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { demoFavorites } from '../../../../../lib/device-demo-data';
import { WatchSection, WatchActionButtons } from '../../../../../lib/watch-ui';

const { Paragraph } = Typography;

export default function DeviceFavoriteDetailPage() {
  const params = useParams<{ favoriteId: string }>();
  const item = demoFavorites.find((entry) => entry.id === params.favoriteId);

  if (!item) {
    return <Result status="404" title="未找到收藏" extra={<Link href="/me"><Button>我的</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Tag color="gold">{item.type}</Tag>
          <p className="device-page-title">{item.title}</p>
          <p className="device-page-subtle">{item.summary}</p>
        </Space>
      </div>
      <WatchSection title="收藏说明">
        <Paragraph style={{ margin: 0, fontSize: 12 }}>
          收藏内容会同步保存在我的页面。
        </Paragraph>
      </WatchSection>
      <WatchActionButtons primary={{ label: '课程', path: '/courses' }} secondary={{ label: '我的', path: '/me' }} />
    </div>
  );
}
