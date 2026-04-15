'use client';

import { Button, Result, Space, Tag, Typography } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { demoCloudFiles } from '../../../../../lib/device-demo-data';
import { WatchSection, WatchActionButtons, WatchInfoRow, WatchNextSteps } from '../../../../../lib/watch-ui';

const { Paragraph } = Typography;

export default function DeviceCloudFileDetailPage() {
  const params = useParams<{ fileId: string }>();
  const file = demoCloudFiles.find((item) => item.id === params.fileId);

  if (!file) {
    return <Result status="404" title="未找到文件" extra={<Link href="/cloud"><Button>网盘</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space wrap>
            <Tag color="blue">{file.type}</Tag>
            <Tag color="default">{file.source}</Tag>
          </Space>
          <p className="device-page-title">{file.title}</p>
          <p className="device-page-subtle">{file.preview}</p>
        </Space>
      </div>
      <WatchSection title="文件信息">
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <WatchInfoRow label="文件大小" value={file.size} />
          <WatchInfoRow label="最近更新" value={file.updatedAt} />
          <WatchInfoRow label="来源" value={file.source} />
        </Space>
      </WatchSection>
      <WatchSection title="文件预览">
        <Paragraph style={{ margin: 0, fontSize: 12 }}>{file.preview}</Paragraph>
      </WatchSection>
      <WatchNextSteps text="文件可用于任务和课程。" />
      <WatchActionButtons primary={{ label: '任务', path: '/tasks' }} secondary={{ label: '网盘', path: '/cloud' }} />
    </div>
  );
}
