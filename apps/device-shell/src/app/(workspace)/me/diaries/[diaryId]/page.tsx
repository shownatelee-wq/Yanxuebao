'use client';

import { Button, Result, Tag, Typography } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getDeviceDiaryById } from '../../../../../lib/device-diary-data';
import { WatchSection, WatchActionButtons, WatchNextSteps } from '../../../../../lib/watch-ui';

const { Paragraph } = Typography;

export default function DeviceDiaryDetailPage() {
  const params = useParams<{ diaryId: string }>();
  const item = getDeviceDiaryById(params.diaryId);

  if (!item) {
    return <Result status="404" title="未找到日记" extra={<Link href="/diary"><Button>研学日记</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <div className="device-inline-stat" style={{ marginBottom: 8, flexWrap: 'wrap' }}>
          <Tag color="blue">{item.sourceRange.label}</Tag>
          <Tag>{item.updatedAt}</Tag>
        </div>
        <p className="device-page-title" style={{ marginTop: 8 }}>{item.title}</p>
        <p className="device-page-subtle">{item.summary}</p>
      </div>
      <WatchSection title="日记内容">
        <Paragraph style={{ margin: 0, fontSize: 12 }}>
          {item.content}
        </Paragraph>
      </WatchSection>
      <WatchNextSteps text="日记内容可同步到成长记录，也可在我的页面查看。" />
      <WatchActionButtons primary={{ label: '研学日记', path: `/diary/${item.id}` }} secondary={{ label: '我的', path: '/me' }} />
    </div>
  );
}
