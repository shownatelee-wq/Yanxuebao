'use client';

import { AudioOutlined, CameraOutlined, LoadingOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Input, Space, Tag, Typography, message } from 'antd';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  appendIdentifyConversation,
  createIdentifyRecordForAsset,
  getIdentifyRecordById,
  getMediaAssetById,
  saveMediaAsset,
  saveScreenshotAsset,
  useDeviceMediaLibrary,
  type DeviceIdentifyRecord,
  type DeviceMediaAsset,
} from '../../../lib/device-media-library';
import { normalizeDeviceTimeValue } from '../../../lib/device-time';

const { Text } = Typography;

const mockIdentifyPresets = [
  {
    title: '海豚近景照片',
    previewLabel: '主池前排',
    primaryLabel: '海豚',
    recognizedNames: ['海豚', '群居动物', '海洋哺乳动物'],
    identifySummary: '识别到海豚。它会通过声音和身体动作与同伴配合，适合继续观察结队活动。',
    accent: 'blue' as const,
  },
  {
    title: '生态设施照片',
    previewLabel: '生态观察点',
    primaryLabel: '青蛙栖息设施',
    recognizedNames: ['青蛙', '湿地设施', '生态保护'],
    identifySummary: '识别到生态设施和青蛙主题元素，可继续提问它为什么适合两栖动物生活。',
    accent: 'green' as const,
  },
];

function buildMockAsset(): DeviceMediaAsset {
  const preset = mockIdentifyPresets[Date.now() % mockIdentifyPresets.length];
  return {
    id: `identify_capture_${Date.now()}`,
    title: preset.title,
    type: '照片',
    albumTab: 'photo',
    createdAt: '刚刚',
    createdAtValue: normalizeDeviceTimeValue('刚刚'),
    previewLabel: preset.previewLabel,
    accent: preset.accent,
    primaryLabel: preset.primaryLabel,
    recognizedNames: preset.recognizedNames,
    identifySummary: preset.identifySummary,
    identifySource: '拍照识别',
    confidence: 0.94,
    summary: preset.identifySummary,
    sourceApp: 'identify',
    canShareToTask: true,
  };
}

export default function DeviceIdentifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { identifyRecords } = useDeviceMediaLibrary();
  const [messageApi, contextHolder] = message.useMessage();
  const [stage, setStage] = useState<'camera' | 'identifying' | 'result'>('camera');
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [question, setQuestion] = useState('它和当前任务有什么关系？');
  const initializedRef = useRef(false);
  const activeRecord = activeRecordId ? getIdentifyRecordById(activeRecordId) : null;
  const latestRecord = activeRecord ?? identifyRecords[0] ?? null;

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    const assetId = searchParams.get('assetId');
    const autoStart = searchParams.get('autoStart') === '1';
    if (!assetId || !autoStart) {
      return;
    }

    const asset = getMediaAssetById(assetId);
    if (!asset) {
      return;
    }

    setStage('identifying');
    const timer = window.setTimeout(() => {
      const record = createIdentifyRecordForAsset(asset.id, searchParams.get('source') === 'album' ? 'album' : 'capture');
      if (record) {
        setActiveRecordId(record.id);
      }
      setStage('result');
    }, 700);

    return () => window.clearTimeout(timer);
  }, [searchParams]);

  const narrationLines = useMemo(() => {
    const record = latestRecord;
    if (!record) {
      return [];
    }

    return [
      record.narration,
      `关键词：${record.recognizedNames.join('、')}`,
      '你可以继续问我：它是什么、它在做什么、为什么会这样。',
    ];
  }, [latestRecord]);

  function startIdentify() {
    const asset = buildMockAsset();
    saveMediaAsset(asset);
    setStage('identifying');
    const timer = window.setTimeout(() => {
      const record = createIdentifyRecordForAsset(asset.id, 'app');
      if (record) {
        setActiveRecordId(record.id);
      }
      setStage('result');
    }, 900);
    return () => window.clearTimeout(timer);
  }

  function askFollowUp(record: DeviceIdentifyRecord) {
    const trimmed = question.trim();
    if (!trimmed) {
      messageApi.warning('先说一句想追问什么');
      return;
    }

    appendIdentifyConversation(record.id, trimmed);
    setQuestion('');
    saveScreenshotAsset({
      title: 'AI识物讲解截图',
      previewLabel: record.primaryLabel,
      summary: `AI识物围绕“${record.primaryLabel}”完成了一次追问讲解。`,
      sourceApp: 'identify',
      linkedEntity: { type: 'identify', id: record.id, title: record.title },
    });
  }

  return (
    <div className="device-page-stack">
      {contextHolder}
      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space wrap>
            <Tag color="red">AI识物</Tag>
            <Tag color="blue">{stage === 'camera' ? '取景识别' : stage === 'identifying' ? '识别中' : '语音讲解'}</Tag>
          </Space>
          <p className="device-page-title">AI识物</p>
          <p className="device-page-subtle">点击取景框或拍照按钮，系统会自动识别并开始语音讲解。</p>
        </Space>
      </div>

      {stage !== 'result' || !latestRecord ? (
        <div className="device-compact-card">
          <button type="button" className={`device-identify-viewfinder ${stage}`} onClick={startIdentify}>
            {stage === 'identifying' ? <LoadingOutlined /> : <CameraOutlined />}
            <strong>{stage === 'identifying' ? '正在自动识别' : '点击屏幕拍照识物'}</strong>
            <span>{stage === 'identifying' ? '大模型正在分析画面和关键对象' : '取景框会模拟摄像头画面'}</span>
          </button>
          <Button type="primary" block style={{ marginTop: 12 }} onClick={startIdentify} loading={stage === 'identifying'}>
            拍照并自动识别
          </Button>
        </div>
      ) : (
        <>
          <div className="device-compact-card">
            <p className="device-section-label">自动语音讲解</p>
            <div className="device-identify-narration">
              <AudioOutlined />
              <div>
                {narrationLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
            <div className="watch-status-pills" style={{ marginTop: 8 }}>
              {latestRecord.recognizedNames.map((name) => (
                <span key={name} className="watch-status-pill">{name}</span>
              ))}
            </div>
          </div>

          <div className="device-compact-card">
            <p className="device-section-label">多轮追问</p>
            <div className="device-chat-thread compact">
              {latestRecord.conversation.map((item) => (
                <div key={item.id} className={`device-chat-bubble${item.role === 'user' ? ' self' : ''}`}>
                  <Text strong style={{ display: 'block', marginBottom: 4 }}>{item.role === 'user' ? '我' : 'AI识物'}</Text>
                  <Text style={{ fontSize: 12 }}>{item.content}</Text>
                </div>
              ))}
            </div>
            <div className="device-identify-compose-bar" style={{ marginTop: 10 }}>
              <Input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="继续追问这张图"
                variant="borderless"
                onPressEnter={() => askFollowUp(latestRecord)}
              />
              <Button type="primary" shape="circle" icon={<SendOutlined />} onClick={() => askFollowUp(latestRecord)} />
            </div>
          </div>

          <div className="device-action-row">
            <Link href={`/identify/${latestRecord.id}`}>
              <Button type="primary" block>记录详情</Button>
            </Link>
            <Button block onClick={() => router.push(`/ask?source=identify&assetId=${latestRecord.assetId}&agentId=plaza_agent_03`)}>
              问问继续分析
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
