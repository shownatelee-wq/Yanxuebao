'use client';

import { CameraOutlined, CheckCircleOutlined, LoadingOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { Button, Segmented, Space, Tag, Typography, message } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { saveDemoDraft } from '../../../lib/demo-draft';
import { saveCaptureAsset, saveCaptureShare, type DeviceCaptureAsset } from '../../../lib/device-capture-share';

const { Paragraph, Text } = Typography;

const captureTips = {
  photo: '拍摄现场照片并保存分析结果。',
  video: '录制现场视频并整理观察内容。',
} as const;

const identifyPresets = {
  photo: [
    {
      title: '海豚近景照片',
      previewLabel: '主池前排',
      accent: 'blue' as const,
      primaryLabel: '海豚',
      recognizedNames: ['海豚', '海洋哺乳动物', '群居动物'],
      identifySummary: '识别到海豚，建议观察它与同伴的协作动作和跃出水面的节奏。',
      confidence: 0.96,
    },
    {
      title: '风筝展台照片',
      previewLabel: '民俗制作区',
      accent: 'green' as const,
      primaryLabel: '风筝',
      recognizedNames: ['风筝', '传统手作', '骨架结构'],
      identifySummary: '识别到风筝，适合继续记录外形结构、图案元素和飞行原理。',
      confidence: 0.92,
    },
    {
      title: '观察树叶照片',
      previewLabel: '植物观察点',
      accent: 'orange' as const,
      primaryLabel: '树叶',
      recognizedNames: ['树叶', '植物观察', '叶脉特征'],
      identifySummary: '识别到植物叶片，适合补充叶形、颜色变化和生长环境。',
      confidence: 0.88,
    },
  ],
  video: [
    {
      title: '海狮互动视频',
      previewLabel: '互动表演区',
      accent: 'purple' as const,
      primaryLabel: '海狮',
      recognizedNames: ['海狮', '表演动作', '关键帧识别'],
      identifySummary: '根据关键帧识别到海狮，建议记录动作顺序和训练提示。',
      confidence: 0.9,
    },
    {
      title: '蜜蜂采蜜视频',
      previewLabel: '花圃边缘',
      accent: 'orange' as const,
      primaryLabel: '蜜蜂',
      recognizedNames: ['蜜蜂', '采蜜行为', '关键帧识别'],
      identifySummary: '根据关键帧识别到蜜蜂，适合继续观察停留位置和采蜜路线。',
      confidence: 0.86,
    },
  ],
} as const;

export default function DeviceCapturePage() {
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [stage, setStage] = useState<'idle' | 'capturing' | 'identifying' | 'identified'>('idle');
  const [currentAsset, setCurrentAsset] = useState<DeviceCaptureAsset | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();
  const timersRef = useRef<number[]>([]);

  const result = useMemo(() => {
    const identifySource = currentAsset?.identifySource ?? (mode === 'photo' ? '拍照识别' : '关键帧识别');
    return {
      title:
        stage === 'identifying'
          ? mode === 'photo'
            ? '照片已保存，正在识物'
            : '视频已保存，正在识物'
          : currentAsset
            ? `${currentAsset.primaryLabel ?? '对象'}识别完成`
            : mode === 'photo'
              ? '照片已保存'
              : '视频已保存',
      detail:
        stage === 'identifying'
          ? mode === 'photo'
            ? '大模型正在分析照片中的主要物体，请稍等片刻。'
            : '大模型正在分析视频关键帧中的主要物体，请稍等片刻。'
          : currentAsset?.identifySummary ??
            (identifySource === '关键帧识别'
              ? '已根据关键帧生成识别结果，可转发给专家或大模型继续分析。'
              : '已识别照片中的主要对象，可转发给专家或大模型继续分析。'),
    };
  }, [currentAsset, mode, stage]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  function buildAsset(): DeviceCaptureAsset {
    const presetList = identifyPresets[mode];
    const preset = presetList[Date.now() % presetList.length];
    return {
      id: `capture_${mode}_${Date.now()}`,
      title: preset.title,
      type: mode === 'photo' ? '照片' : '视频',
      capturedAt: '刚刚',
      previewLabel: preset.previewLabel,
      accent: preset.accent,
      summary:
        mode === 'photo'
          ? `这是一张刚拍摄的现场照片，系统识别到的主要对象是${preset.primaryLabel}，请结合研学内容帮我分析。`
          : `这是一段刚拍摄的现场视频，系统通过关键帧识别到${preset.primaryLabel}，请结合研学内容帮我分析。`,
      primaryLabel: preset.primaryLabel,
      recognizedNames: [...preset.recognizedNames],
      identifySummary: preset.identifySummary,
      identifySource: mode === 'photo' ? '拍照识别' : '关键帧识别',
      confidence: preset.confidence,
    };
  }

  function handleCapture() {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
    setCurrentAsset(null);
    setStage('capturing');
    const captureTimer = window.setTimeout(() => {
      const asset = buildAsset();
      saveCaptureAsset(asset);
      setCurrentAsset(asset);
      setStage('identifying');
      const identifyTimer = window.setTimeout(() => {
        setStage('identified');
      }, 1100);
      timersRef.current.push(identifyTimer);
    }, 900);
    timersRef.current.push(captureTimer);
  }

  function handleSend(target: 'expert' | 'model') {
    const asset = currentAsset ?? buildAsset();
    saveCaptureAsset(asset);
    saveCaptureShare(asset, target);
    router.push(target === 'expert' ? '/plaza/agents/plaza_agent_03' : '/ask?agentId=plaza_agent_03');
  }

  return (
    <div className="device-page-stack">
      {contextHolder}

      <div className="device-hero-card device-stage-card" style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space>
            <Tag color="blue">拍拍</Tag>
            <Tag color="green">{mode === 'photo' ? '拍照' : '拍视频'}</Tag>
          </Space>
          <p className="device-page-title">拍摄窗</p>
          <p className="device-page-subtle">{captureTips[mode]}</p>
        </Space>
      </div>

      <div className="device-compact-card">
        <Segmented
          block
          value={mode}
          onChange={(value) => {
            setMode(value as 'photo' | 'video');
            timersRef.current.forEach((timer) => window.clearTimeout(timer));
            timersRef.current = [];
            setStage('idle');
            setCurrentAsset(null);
          }}
          options={[
            { label: '拍照', value: 'photo' },
            { label: '拍视频', value: 'video' },
          ]}
        />
      </div>

      <div className="device-compact-card">
        <div className={`device-capture-stage ${stage}`}>
          {stage === 'identifying' ? <LoadingOutlined /> : mode === 'photo' ? <CameraOutlined /> : <PlayCircleOutlined />}
        </div>
        <div className="device-action-row">
          <Button type="primary" onClick={handleCapture} block>
            {stage === 'capturing'
              ? mode === 'photo'
                ? '拍照中...'
                : '录制中...'
              : stage === 'identifying'
                ? '识别中...'
                : mode === 'photo'
                  ? '开始拍照'
                  : '开始录制'}
          </Button>
          <Button
            disabled={stage !== 'identified'}
            block
            onClick={() => {
              saveDemoDraft({
                type: mode === 'photo' ? 'image' : 'video',
                title: `识物结果：${currentAsset?.primaryLabel ?? result.title}`,
                content: currentAsset?.identifySummary ?? result.detail,
                source: 'capture',
                updatedAt: new Date().toISOString(),
              });
              messageApi.success('已加入任务草稿');
            }}
          >
            加入任务
          </Button>
        </div>
      </div>

      <div className="device-compact-card">
        <p className="device-section-label">采集结果</p>
        {stage === 'identifying' || stage === 'identified' ? (
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Space>
              {stage === 'identified' ? (
                <CheckCircleOutlined style={{ color: '#20bf6b' }} />
              ) : (
                <LoadingOutlined style={{ color: '#2f6bff' }} />
              )}
              <Text strong style={{ fontSize: 12 }}>{result.title}</Text>
            </Space>
            {currentAsset?.recognizedNames?.length ? (
              <div className="device-identify-marquee">
                <div className="device-identify-marquee-track">
                  {[...currentAsset.recognizedNames, ...currentAsset.recognizedNames].map((item, index) => (
                    <span key={`${item}-${index}`} className="device-identify-chip">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
              {result.detail}
            </Paragraph>
            {currentAsset ? (
              <div className="device-answer-note">
                <Text strong style={{ fontSize: 12 }}>
                  {currentAsset.primaryLabel}
                  {typeof currentAsset.confidence === 'number' ? ` · 置信度 ${Math.round(currentAsset.confidence * 100)}%` : ''}
                </Text>
                <Paragraph style={{ margin: '6px 0 0', fontSize: 11 }}>
                  {currentAsset.identifySource === '关键帧识别' ? '视频识别方式：关键帧识别。' : '图片识别方式：拍照识别。'}
                </Paragraph>
              </div>
            ) : null}
            <div className="device-action-row">
              <Button type="primary" block onClick={() => handleSend('expert')} disabled={stage !== 'identified'}>
                发送给专家
              </Button>
              <Button block onClick={() => handleSend('model')} disabled={stage !== 'identified'}>
                发送给大模型
              </Button>
            </div>
          </Space>
        ) : (
          <Paragraph type="secondary" style={{ margin: 0, fontSize: 11 }}>
            暂时没有采集结果。
          </Paragraph>
        )}
      </div>

      <div className="device-action-row">
        <Link href="/tasks">
          <Button type="primary" block>任务</Button>
        </Link>
        <Link href="/album">
          <Button block>看相册</Button>
        </Link>
      </div>
    </div>
  );
}
