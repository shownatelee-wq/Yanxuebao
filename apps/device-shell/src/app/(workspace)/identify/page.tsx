'use client';

import { Button, Space, Tag, Typography, message } from 'antd';
import Link from 'next/link';
import { saveDemoDraft } from '../../../lib/demo-draft';
import { useCaptureAssets } from '../../../lib/device-capture-share';

const { Paragraph, Text } = Typography;

export default function DeviceIdentifyPage() {
  const assets = useCaptureAssets();
  const [messageApi, contextHolder] = message.useMessage();
  const latestAsset = assets[0] ?? null;

  return (
    <div className="device-page-stack">
      {contextHolder}

      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space>
            <Tag color="red">识物</Tag>
            <Tag color="blue">最近识别</Tag>
          </Space>
          <p className="device-page-title">识物记录</p>
          <p className="device-page-subtle">拍拍拍完后会自动识别，结果会同步到这里。</p>
        </Space>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">最新识别</p>
        {latestAsset ? (
          <>
            {latestAsset.recognizedNames?.length ? (
              <div className="device-identify-marquee">
                <div className="device-identify-marquee-track">
                  {[...latestAsset.recognizedNames, ...latestAsset.recognizedNames].map((item, index) => (
                    <span key={`${item}-${index}`} className="device-identify-chip">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            <Text strong style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
              {latestAsset.primaryLabel ?? latestAsset.title}
            </Text>
            <Paragraph style={{ margin: '6px 0 0', fontSize: 12 }}>
              {latestAsset.identifySummary ?? '已完成识别，可继续发送给专家或大模型。'}
            </Paragraph>
            <div className="watch-status-pills" style={{ marginTop: 8 }}>
              <span className="watch-status-pill">{latestAsset.identifySource ?? '拍照识别'}</span>
              {typeof latestAsset.confidence === 'number' ? (
                <span className="watch-status-pill">置信度 {Math.round(latestAsset.confidence * 100)}%</span>
              ) : null}
            </div>
          </>
        ) : (
          <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
            还没有识物记录，先去拍拍拍一张试试。
          </Paragraph>
        )}
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">最近识别列表</p>
        <div className="device-mini-list">
          {assets.slice(0, 4).map((item) => (
            <div key={item.id} className="device-mini-item watch-list-card">
              <div className="device-mini-item-title">
                <span>{item.primaryLabel ?? item.title}</span>
                <Tag color={item.type === '视频' ? 'purple' : 'green'}>{item.type}</Tag>
              </div>
              <p className="device-mini-item-desc">{item.identifySummary ?? item.summary}</p>
              <div className="watch-status-pills">
                {(item.recognizedNames ?? [item.primaryLabel ?? '识别结果']).slice(0, 3).map((name) => (
                  <span key={`${item.id}-${name}`} className="watch-status-pill">{name}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="device-action-row">
        <Button
          block
          disabled={!latestAsset}
          onClick={() => {
            if (!latestAsset) {
              return;
            }
            saveDemoDraft({
              type: latestAsset.type === '照片' ? 'image' : 'video',
              title: `识物结果：${latestAsset.primaryLabel ?? latestAsset.title}`,
              content: latestAsset.identifySummary ?? latestAsset.summary,
              source: 'identify',
              updatedAt: new Date().toISOString(),
            });
            messageApi.success('已加入任务草稿');
          }}
        >
          加入任务
        </Button>
        <Link href="/ask">
          <Button type="primary" block>问问</Button>
        </Link>
      </div>

      <div className="device-action-row">
        <Link href="/capture">
          <Button type="primary" block>去拍拍</Button>
        </Link>
        <Link href="/album">
          <Button block>看相册</Button>
        </Link>
      </div>
    </div>
  );
}
