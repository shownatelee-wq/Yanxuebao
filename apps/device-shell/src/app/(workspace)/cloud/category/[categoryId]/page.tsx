'use client';

import { Button, Result, Typography } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { demoCloudCategories, demoCloudFiles } from '../../../../../lib/device-demo-data';
import { WatchHero, WatchSection, WatchActionButtons, WatchNextSteps } from '../../../../../lib/watch-ui';

const { Paragraph } = Typography;

export default function DeviceCloudCategoryPage() {
  const params = useParams<{ categoryId: string }>();
  const category = demoCloudCategories.find((item) => item.id === params.categoryId);
  const files = demoCloudFiles.filter((item) => item.categoryId === params.categoryId);

  if (!category) {
    return <Result status="404" title="未找到分类" extra={<Link href="/cloud"><Button>网盘</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      <WatchHero title={category.title} subtitle={`共 ${category.count} 个文件`} />
      <WatchSection title="文件列表">
        <div className="device-mini-list">
          {files.map((file) => (
            <Link key={file.id} href={`/cloud/files/${file.id}`} className="device-card-link">
              <div className="device-mini-item">
                <div className="device-mini-item-title">
                  <span>{file.title}</span>
                  <span>{file.size}</span>
                </div>
                <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
                  {file.source} · {file.updatedAt}
                </Paragraph>
              </div>
            </Link>
          ))}
        </div>
      </WatchSection>
      <WatchNextSteps text="文件都保存在这里。" />
      <WatchActionButtons primary={{ label: '网盘', path: '/cloud' }} secondary={{ label: '最近文件', path: `/cloud/files/${files[0]?.id ?? 'cloud_file_01'}` }} />
    </div>
  );
}
