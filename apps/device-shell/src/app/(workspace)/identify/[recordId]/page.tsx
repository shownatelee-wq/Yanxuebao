'use client';

import { Button, Result, Space, Tag, Typography, message } from 'antd';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { saveDemoDraft } from '../../../../lib/demo-draft';
import {
  getIdentifyRecordById,
  getMediaAssetById,
  saveScreenshotAsset,
} from '../../../../lib/device-media-library';
import { WatchInfoRow } from '../../../../lib/watch-ui';

const { Paragraph, Text } = Typography;

export default function DeviceIdentifyRecordDetailPage() {
  const params = useParams<{ recordId: string }>();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const record = getIdentifyRecordById(params.recordId);
  const asset = record ? getMediaAssetById(record.assetId) : null;

  if (!record) {
    return <Result status="404" title="未找到识物记录" extra={<Link href="/identify"><Button>AI识物</Button></Link>} />;
  }

  return (
    <div className="device-page-stack">
      {contextHolder}
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space wrap>
            <Tag color="red">AI识物记录</Tag>
            <Tag color="blue">{record.source}</Tag>
          </Space>
          <p className="device-page-title">{record.title}</p>
          <p className="device-page-subtle">{record.summary}</p>
        </Space>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">识别来源</p>
        <div className="device-detail-grid">
          <WatchInfoRow label="素材" value={asset?.title ?? record.assetId} />
          <WatchInfoRow label="时间" value={record.createdAt} />
          <WatchInfoRow label="主要对象" value={record.primaryLabel} />
          <WatchInfoRow label="可分享给" value={record.shareTargets.join('、')} />
        </div>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">讲解文字</p>
        <Paragraph style={{ margin: 0, fontSize: 12 }}>{record.narration}</Paragraph>
        <div className="watch-status-pills" style={{ marginTop: 8 }}>
          {record.recognizedNames.map((name) => (
            <span key={name} className="watch-status-pill">{name}</span>
          ))}
        </div>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">追问记录</p>
        <div className="device-chat-thread compact">
          {record.conversation.map((item) => (
            <div key={item.id} className={`device-chat-bubble${item.role === 'user' ? ' self' : ''}`}>
              <Text strong style={{ display: 'block', marginBottom: 4 }}>{item.role === 'user' ? '我' : 'AI识物'}</Text>
              <Text style={{ fontSize: 12 }}>{item.content}</Text>
            </div>
          ))}
        </div>
      </div>

      <div className="device-action-row">
        <Button
          type="primary"
          block
          onClick={() => {
            saveDemoDraft({
              type: 'text',
              title: record.title,
              content: record.summary,
              source: 'identify',
              updatedAt: new Date().toISOString(),
            });
            messageApi.success('已加入任务作品过程记录');
          }}
        >
          加入任务作品
        </Button>
        <Button
          block
          onClick={() => {
            saveScreenshotAsset({
              title: `${record.primaryLabel}识物截图`,
              previewLabel: record.primaryLabel,
              summary: record.summary,
              sourceApp: 'identify',
              linkedEntity: { type: 'identify', id: record.id, title: record.title },
            });
            messageApi.success('已保存到相册截图');
          }}
        >
          保存截图
        </Button>
      </div>
      <div className="device-action-row">
        <Button block onClick={() => messageApi.success('已发送给家长/老师')}>
          发送家长/老师
        </Button>
        <Button block onClick={() => router.push(`/ask?source=identify&assetId=${record.assetId}`)}>
          问问继续聊
        </Button>
      </div>
    </div>
  );
}
