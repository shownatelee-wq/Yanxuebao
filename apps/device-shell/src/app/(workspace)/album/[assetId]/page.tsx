'use client';

import { Button, Result, Space, Tag, message } from 'antd';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { saveDemoDraft } from '../../../../lib/demo-draft';
import { saveCaptureShare } from '../../../../lib/device-capture-share';
import {
  createIdentifyRecordForAsset,
  getIdentifyRecordByAssetId,
  getMediaAssetById,
} from '../../../../lib/device-media-library';
import { WatchInfoRow } from '../../../../lib/watch-ui';

export default function DeviceAlbumAssetDetailPage() {
  const params = useParams<{ assetId: string }>();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const asset = getMediaAssetById(params.assetId);
  const identifyRecord = asset ? getIdentifyRecordByAssetId(asset.id) : null;

  if (!asset) {
    return <Result status="404" title="未找到相册内容" extra={<Link href="/album"><Button>返回相册</Button></Link>} />;
  }

  const safeAsset = asset;

  function openIdentify() {
    const record = createIdentifyRecordForAsset(safeAsset.id, 'album');
    if (!record) {
      return;
    }
    router.push(`/identify/${record.id}`);
  }

  return (
    <div className="device-page-stack">
      {contextHolder}
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space wrap>
            <Tag color={asset.albumTab === 'video' ? 'purple' : asset.albumTab === 'screenshot' ? 'blue' : 'green'}>
              {asset.type}
            </Tag>
            <Tag color="default">{asset.sourceApp}</Tag>
          </Space>
          <p className="device-page-title">{asset.title}</p>
          <p className="device-page-subtle">{asset.summary}</p>
        </Space>
      </div>

      <div className="device-compact-card">
        <div className={`device-album-detail-preview accent-${asset.accent ?? 'blue'}`}>
          <span>{asset.previewLabel ?? asset.title}</span>
          {asset.duration ? <em>{asset.duration}</em> : null}
        </div>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">资源信息</p>
        <div className="device-detail-grid">
          <WatchInfoRow label="时间" value={asset.createdAt} />
          <WatchInfoRow label="来源" value={asset.sourceApp} />
          <WatchInfoRow label="可加入任务" value={asset.canShareToTask ? '可以' : '不可'} />
          <WatchInfoRow label="关联记录" value={identifyRecord ? identifyRecord.title : asset.linkedEntity?.title ?? '暂无'} />
        </div>
      </div>

      <div className="device-action-row">
        <Button type="primary" block onClick={openIdentify}>
          {identifyRecord ? '查看AI识物记录' : '发送AI识物'}
        </Button>
        <Button
          block
          onClick={() => {
            saveCaptureShare(safeAsset, 'model', 'plaza_agent_03');
            router.push(`/ask?source=album&assetId=${safeAsset.id}&agentId=plaza_agent_03`);
          }}
        >
          发给问问
        </Button>
      </div>
      <div className="device-action-row">
        <Button
          block
          onClick={() => {
            saveDemoDraft({
              type: asset.albumTab === 'video' ? 'video' : 'image',
              title: asset.title,
              content: asset.summary,
              source: 'capture',
              updatedAt: new Date().toISOString(),
            });
            messageApi.success('已加入任务草稿');
          }}
        >
          加入任务
        </Button>
        <Link href={`/album?tab=${asset.albumTab}`}>
          <Button block>返回相册</Button>
        </Link>
      </div>
    </div>
  );
}
