'use client';

import {
  AudioOutlined,
  PictureOutlined,
  SendOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Button, Input, Segmented, message } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { createAiCreateSession, type DeviceAiCreateMode } from '../../../lib/device-ai-create-state';
import { getMediaAssetById, useDeviceMediaLibrary } from '../../../lib/device-media-library';

function toMode(value: string | null): DeviceAiCreateMode {
  return value === 'video' ? 'video' : 'image';
}

function getDefaultPrompt(mode: DeviceAiCreateMode) {
  return mode === 'image'
    ? '描述你想要的图片主体、风格、颜色'
    : '描述你想要的视频主体、动作、运镜';
}

function getVoicePrompt(mode: DeviceAiCreateMode) {
  return mode === 'image'
    ? '把这张海洋馆照片改成蓝色科普海报风格'
    : '让这段海洋馆视频生成一段 15 秒慢镜头讲解视频';
}

function getSelectAssetHref(mode: DeviceAiCreateMode, prompt: string, assetId?: string | null) {
  const searchParams = new URLSearchParams();
  searchParams.set('mode', mode);
  if (prompt.trim()) {
    searchParams.set('prompt', prompt.trim());
  }
  if (assetId) {
    searchParams.set('assetId', assetId);
  }
  return `/ai-create/select?${searchParams.toString()}`;
}

function getExpectedTab(mode: DeviceAiCreateMode) {
  return mode === 'image' ? 'photo' : 'video';
}

export default function DeviceAiCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mediaSnapshot = useDeviceMediaLibrary();
  const [messageApi, contextHolder] = message.useMessage();

  const queryMode = toMode(searchParams.get('mode'));
  const queryPrompt = searchParams.get('prompt');
  const queryAssetId = searchParams.get('assetId');
  const selectedAsset = useMemo(
    () => {
      if (!queryAssetId) {
        return null;
      }
      const asset = getMediaAssetById(queryAssetId);
      if (!asset || asset.albumTab !== getExpectedTab(queryMode)) {
        return null;
      }
      return asset;
    },
    [mediaSnapshot.assets, queryAssetId, queryMode],
  );

  const [prompt, setPrompt] = useState(queryPrompt ?? '');

  useEffect(() => {
    setPrompt(queryPrompt ?? '');
  }, [queryPrompt]);

  function changeMode(nextMode: DeviceAiCreateMode) {
    const nextSearchParams = new URLSearchParams();
    nextSearchParams.set('mode', nextMode);
    if (prompt.trim()) {
      nextSearchParams.set('prompt', prompt.trim());
    }
    const rawAsset = queryAssetId ? getMediaAssetById(queryAssetId) : null;
    if (rawAsset?.albumTab === getExpectedTab(nextMode) && queryAssetId) {
      nextSearchParams.set('assetId', queryAssetId);
    }
    router.replace(`/ai-create?${nextSearchParams.toString()}`);
  }

  function submitCreate() {
    if (!selectedAsset) {
      messageApi.warning(queryMode === 'image' ? '先添加一张图片' : '先添加一段视频');
      return;
    }

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      messageApi.warning(queryMode === 'image' ? '先输入图片提示词' : '先输入视频提示词');
      return;
    }

    const session = createAiCreateSession({
      mode: queryMode,
      assetId: selectedAsset.id,
      prompt: trimmedPrompt,
    });
    router.push(queryMode === 'image' ? `/ai-draw/chat/${session.id}` : `/ai-video/chat/${session.id}`);
  }

  return (
    <div className="device-ai-studio-page">
      {contextHolder}
      <div className="device-ai-studio-top">
        <Segmented
          className="device-ai-studio-switch"
          value={queryMode}
          onChange={(value) => changeMode(value as DeviceAiCreateMode)}
          options={[
            { label: 'AI生图', value: 'image' },
            { label: 'AI视频', value: 'video' },
          ]}
        />
      </div>

      <div className="device-ai-studio-stage">
        <button
          type="button"
          className={`device-ai-import-card${selectedAsset ? ' selected' : ''}`}
          onClick={() => router.push(getSelectAssetHref(queryMode, prompt, selectedAsset?.id))}
        >
          {selectedAsset ? (
            <>
              <div className={`device-ai-import-preview accent-${selectedAsset.accent ?? 'blue'}`}>
                <span>{selectedAsset.previewLabel ?? selectedAsset.title}</span>
              </div>
              <strong>{selectedAsset.title}</strong>
              <em>{selectedAsset.summary}</em>
            </>
          ) : (
            <>
              {queryMode === 'image' ? <PictureOutlined /> : <VideoCameraOutlined />}
              <strong>{queryMode === 'image' ? '导入图片' : '导入视频'}</strong>
            </>
          )}
        </button>
      </div>

      <div className="device-ai-studio-footer">
        <div className="device-ai-studio-composer">
          <Input.TextArea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            autoSize={{ minRows: 3, maxRows: 5 }}
            variant="borderless"
            className="device-ai-studio-input"
            placeholder={getDefaultPrompt(queryMode)}
          />
          <div className="device-ai-studio-toolbar">
            <div className="device-ai-studio-toolbar-left">
              <button
                type="button"
                className="device-ai-studio-pill"
                onClick={() => router.push(getSelectAssetHref(queryMode, prompt, selectedAsset?.id))}
              >
                {queryMode === 'image' ? '添加图片' : '添加视频'}
              </button>
            </div>
            <div className="device-ai-studio-toolbar-right">
              <Button
                shape="circle"
                icon={<AudioOutlined />}
                onClick={() => {
                  setPrompt(getVoicePrompt(queryMode));
                  messageApi.success('已模拟语音输入提示词');
                }}
              />
              <Button type="primary" shape="round" icon={<SendOutlined />} onClick={submitCreate}>
                生成
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
