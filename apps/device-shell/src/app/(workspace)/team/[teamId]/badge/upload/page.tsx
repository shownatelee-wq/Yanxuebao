'use client';

import {
  CameraOutlined,
  DownloadOutlined,
  LoadingOutlined,
  PictureOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { Button, Input, Result, Space, Tag, Typography, message } from 'antd';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { saveCaptureAsset, useCaptureAssets, type DeviceCaptureAsset } from '../../../../../../lib/device-capture-share';
import { updateTeamGroupProfile, useDeviceTeamSnapshot } from '../../../../../../lib/device-team-data';
import { WatchHero, WatchSection } from '../../../../../../lib/watch-ui';

const { Paragraph, Text } = Typography;

type UploadMode = 'photo' | 'ai' | 'album';
type BadgeDraft = { title: string; emoji: string; image: string; prompt?: string };

function normalizeMode(value: string | null): UploadMode {
  if (value === 'ai' || value === 'album') {
    return value;
  }
  return 'photo';
}

function buildAiBadge(prompt: string, groupName: string): BadgeDraft {
  const cleanPrompt = prompt.trim() || `${groupName} 蓝色海洋探索徽章`;
  if (cleanPrompt.includes('航天') || cleanPrompt.includes('星') || cleanPrompt.includes('火箭')) {
    return { title: '星航探索勋章', emoji: '🚀', image: 'ai-badge-rocket.png', prompt: cleanPrompt };
  }
  if (cleanPrompt.includes('雨林') || cleanPrompt.includes('植物') || cleanPrompt.includes('自然')) {
    return { title: '雨林观察勋章', emoji: '🌿', image: 'ai-badge-rainforest.png', prompt: cleanPrompt };
  }
  return { title: '海浪探索勋章', emoji: '🌊', image: 'ai-badge-wave.png', prompt: cleanPrompt };
}

export default function DeviceTeamBadgeUploadPage() {
  const params = useParams<{ teamId: string }>();
  const searchParams = useSearchParams();
  const mode = normalizeMode(searchParams.get('mode'));
  const [messageApi, contextHolder] = message.useMessage();
  const { teams, details } = useDeviceTeamSnapshot();
  const assets = useCaptureAssets();
  const team = teams.find((item) => item.id === params.teamId);
  const detail = params.teamId ? details[params.teamId] : undefined;
  const groupId = searchParams.get('groupId') ?? detail?.myGroupId;
  const group = detail?.groups.find((item) => item.id === groupId);
  const currentMember = group?.members.find((member) => member.isCurrentStudent);
  const canManage = Boolean(currentMember?.canManageGroupProfile);
  const [prompt, setPrompt] = useState('蓝色海洋探索徽章，包含海豚、路线和小组协作元素');
  const [generatedBadge, setGeneratedBadge] = useState<BadgeDraft | null>(null);
  const [cameraStage, setCameraStage] = useState<'preview' | 'capturing' | 'captured'>('preview');
  const [capturedBadge, setCapturedBadge] = useState<BadgeDraft | null>(null);

  const photoAssets = useMemo(() => assets.filter((asset) => asset.type === '照片'), [assets]);

  if (!team || !detail || !group) {
    return <Result status="404" title="未找到小组徽章上传页" extra={<Link href="/team"><Button>更多团队</Button></Link>} />;
  }

  const pageTitle = mode === 'ai' ? 'AI创建勋章' : mode === 'album' ? '相册选择图片' : '上传徽章';
  const safeTeam = team;
  const safeGroup = group;

  function applyBadge(nextBadge: BadgeDraft) {
    if (!canManage) {
      messageApi.warning('只有组长或副组长可以上传小组徽章');
      return;
    }
    updateTeamGroupProfile(safeTeam.id, safeGroup.id, {
      customName: safeGroup.customName ?? safeGroup.name,
      badgeTitle: nextBadge.title,
      badgeEmoji: nextBadge.emoji,
      badgeImage: nextBadge.image,
    });
    messageApi.success(`已设为小组徽章：${nextBadge.title}`);
  }

  function saveBadgeToAlbum(nextBadge: BadgeDraft) {
    const asset: DeviceCaptureAsset = {
      id: `badge_${Date.now()}`,
      title: nextBadge.title,
      type: '照片',
      capturedAt: '刚刚',
      previewLabel: nextBadge.title,
      accent: 'blue',
      primaryLabel: '小组徽章',
      recognizedNames: ['徽章', safeGroup.displayName, 'AI创作'],
      identifySummary: nextBadge.prompt ? `根据提示词“${nextBadge.prompt}”生成的小组徽章。` : '已保存的小组徽章图片。',
      identifySource: '拍照识别',
      confidence: 0.96,
      summary: '已保存到相册，可继续设为小组徽章。',
    };
    saveCaptureAsset(asset);
    messageApi.success('已下载并保存到相册');
  }

  function handleGenerateBadge() {
    const nextBadge = buildAiBadge(prompt, safeGroup.displayName);
    setGeneratedBadge(nextBadge);
    messageApi.success('已生成徽章');
  }

  function handleCaptureBadge() {
    setCameraStage('capturing');
    window.setTimeout(() => {
      setCapturedBadge({
        title: `${safeGroup.customName ?? safeGroup.name}手绘勋章`,
        emoji: '📷',
        image: 'camera-badge-demo.png',
      });
      setCameraStage('captured');
    }, 700);
  }

  return (
    <div className="device-page-stack">
      {contextHolder}
      <WatchHero
        title={pageTitle}
        subtitle={
          mode === 'ai'
            ? '输入生成徽章的提示词，发送后生成一枚可下载保存的徽章。'
            : mode === 'album'
              ? '从相册里选择一张图片，作为当前小组徽章。'
              : '打开摄像头拍摄手绘徽章，再设为小组徽章。'
        }
        tags={[{ label: safeGroup.displayName }, { label: canManage ? '组长可上传' : '仅查看', color: canManage ? 'green' : 'default' }]}
      />

      {mode === 'ai' ? (
        <>
          <WatchSection title="AI对话框">
            <div className="device-chat-thread">
              <div className="device-chat-bubble">
                输入一段徽章提示词，我会生成一枚小组勋章。
              </div>
              {generatedBadge ? (
                <div className="device-chat-bubble self">
                  {generatedBadge.prompt}
                </div>
              ) : null}
              {generatedBadge ? (
                <div className="device-mini-item">
                  <div className="device-mini-item-title">
                    <span>{generatedBadge.emoji} {generatedBadge.title}</span>
                    <Tag color="blue">已生成</Tag>
                  </div>
                  <p className="device-mini-item-desc">适合用于{safeGroup.displayName}的小组面板展示。</p>
                  <div className="device-action-chip-row" style={{ marginTop: 8 }}>
                    <Button size="small" icon={<DownloadOutlined />} onClick={() => saveBadgeToAlbum(generatedBadge)}>
                      下载
                    </Button>
                    <Button size="small" type="primary" disabled={!canManage} onClick={() => applyBadge(generatedBadge)}>
                      设为勋章
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
            <Space.Compact style={{ width: '100%', marginTop: 10 }}>
              <Input value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="输入生成徽章的提示词" />
              <Button type="primary" icon={<SendOutlined />} onClick={handleGenerateBadge}>
                发送
              </Button>
            </Space.Compact>
          </WatchSection>
        </>
      ) : null}

      {mode === 'photo' ? (
        <WatchSection title="拍照上传">
          <div className={`device-capture-stage ${cameraStage === 'capturing' ? 'capturing' : cameraStage === 'captured' ? 'done' : ''}`}>
            {cameraStage === 'capturing' ? <LoadingOutlined /> : <CameraOutlined />}
            <Text strong style={{ fontSize: 12 }}>
              {cameraStage === 'capturing' ? '正在拍摄徽章...' : cameraStage === 'captured' ? '徽章照片已拍摄' : '摄像头已打开'}
            </Text>
            <Paragraph style={{ margin: '6px 0 0', fontSize: 11 }}>
              {cameraStage === 'captured' ? '可使用这张照片作为小组徽章。' : '请将手绘徽章放入取景框中央。'}
            </Paragraph>
          </div>
          {capturedBadge ? (
            <div className="device-mini-item" style={{ marginTop: 10 }}>
              <div className="device-mini-item-title">
                <span>{capturedBadge.emoji} {capturedBadge.title}</span>
                <Tag color="green">拍摄完成</Tag>
              </div>
              <p className="device-mini-item-desc">已生成一张徽章照片，可保存或设为小组徽章。</p>
            </div>
          ) : null}
          <div className="device-action-row" style={{ marginTop: 10 }}>
            <Button type="primary" block disabled={!canManage || cameraStage === 'capturing'} onClick={handleCaptureBadge}>
              {cameraStage === 'captured' ? '重新拍摄' : '拍摄徽章'}
            </Button>
            <Button block disabled={!capturedBadge} onClick={() => capturedBadge && applyBadge(capturedBadge)}>
              使用照片
            </Button>
          </div>
          <div className="device-action-row" style={{ marginTop: 10 }}>
            <Link href={`/team/${safeTeam.id}/badge/upload?groupId=${safeGroup.id}&mode=album`}>
              <Button icon={<PictureOutlined />} block>相册选择图片</Button>
            </Link>
          </div>
        </WatchSection>
      ) : null}

      {mode === 'album' ? (
        <WatchSection title="相册图片">
          <div className="device-album-grid">
            {photoAssets.map((asset) => (
              <div key={asset.id} className={`device-album-tile accent-${asset.accent ?? 'blue'}`}>
                <div className="device-album-thumb">
                  {asset.primaryLabel ? <span className="device-album-badge">{asset.primaryLabel}</span> : null}
                  <span>{asset.previewLabel ?? asset.title}</span>
                </div>
                <div className="device-mini-item-title" style={{ marginTop: 8 }}>
                  <span>{asset.title}</span>
                  <Tag color="green">图片</Tag>
                </div>
                <p className="device-mini-item-desc">{asset.capturedAt}</p>
                <Button
                  size="small"
                  type="primary"
                  block
                  disabled={!canManage}
                  onClick={() =>
                    applyBadge({
                      title: `${asset.primaryLabel ?? asset.title}勋章`,
                      emoji: '🖼️',
                      image: `${asset.id}.png`,
                    })
                  }
                >
                  选择图片
                </Button>
              </div>
            ))}
          </div>
        </WatchSection>
      ) : null}

      <div className="device-action-row">
        <Link href={`/team/${safeTeam.id}/badge?groupId=${safeGroup.id}`}>
          <Button type="primary" block>名称与徽章</Button>
        </Link>
        <Link href={`/team/${safeTeam.id}/groups/${safeGroup.id}`}>
          <Button block>小组详情</Button>
        </Link>
      </div>
    </div>
  );
}
