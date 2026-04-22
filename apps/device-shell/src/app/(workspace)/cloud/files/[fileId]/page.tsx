'use client';

import { Button, Result, Space, Tag, message } from 'antd';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { markCloudFileDownloaded, useDeviceWorkspaceSnapshot } from '../../../../../lib/device-workspace-state';
import { WatchSection, WatchActionButtons, WatchInfoRow, WatchNextSteps } from '../../../../../lib/watch-ui';

export default function DeviceCloudFileDetailPage() {
  const params = useParams<{ fileId: string }>();
  const [messageApi, contextHolder] = message.useMessage();
  const { cloudFiles } = useDeviceWorkspaceSnapshot();
  const file = cloudFiles.find((item) => item.id === params.fileId);

  if (!file) {
    return <Result status="404" title="未找到文件" extra={<Link href="/cloud"><Button>网盘</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      {contextHolder}
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
          {file.duration ? <WatchInfoRow label="时长" value={file.duration} /> : null}
          <WatchInfoRow label="下载状态" value={file.downloaded ? '已下载到本地' : '未下载'} />
        </Space>
      </WatchSection>
      <WatchSection title="文件预览">
        <div className={`device-cloud-preview ${file.type === '视频' ? 'video' : file.type === '音频' ? 'audio' : 'doc'}`}>
          <strong>{file.type === '视频' ? '视频播放态' : file.type === '音频' ? '音乐播放态' : '文件预览态'}</strong>
          <span>{file.preview}</span>
        </div>
        <div className="device-action-row" style={{ marginTop: 10 }}>
          {(file.type === '视频' || file.type === '音频') ? (
            <Button type="primary" block onClick={() => messageApi.success(`正在播放${file.title}`)}>
              播放
            </Button>
          ) : (
            <Button type="primary" block onClick={() => messageApi.success('已打开文档预览')}>
              预览
            </Button>
          )}
          <Button
            block
            onClick={() => {
              markCloudFileDownloaded(file.id);
              messageApi.success('已下载到本地');
            }}
          >
            下载到本地
          </Button>
        </div>
      </WatchSection>
      <WatchNextSteps text="文件可用于任务和课程。" />
      <WatchActionButtons primary={{ label: '任务', path: '/tasks' }} secondary={{ label: '网盘', path: '/cloud' }} />
    </div>
  );
}
