'use client';

import { Button, Result, Tag, Typography } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { demoDiaries } from '../../../../../lib/device-demo-data';
import { WatchSection, WatchActionButtons, WatchNextSteps } from '../../../../../lib/watch-ui';

const { Paragraph } = Typography;

export default function DeviceDiaryDetailPage() {
  const params = useParams<{ diaryId: string }>();
  const item = demoDiaries.find((entry) => entry.id === params.diaryId);

  if (!item) {
    return <Result status="404" title="未找到日记" extra={<Link href="/me"><Button>我的</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Tag color="blue">{item.createdAt}</Tag>
        <p className="device-page-title" style={{ marginTop: 8 }}>{item.title}</p>
        <p className="device-page-subtle">{item.summary}</p>
      </div>
      <WatchSection title="日记内容">
        <Paragraph style={{ margin: 0, fontSize: 12 }}>
          今天我在海豚馆观察到了三次跃出水面的动作，还记录了海豚群体配合的过程。
        </Paragraph>
      </WatchSection>
      <WatchNextSteps text="日记内容可同步到成长记录，也可在我的页面查看。" />
      <WatchActionButtons primary={{ label: '成长', path: '/growth' }} secondary={{ label: '我的', path: '/me' }} />
    </div>
  );
}
