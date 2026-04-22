'use client';

import { Button, Result } from 'antd';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { type DeviceAiCreateMode } from '../../../../lib/device-ai-create-state';
import { getAlbumAssets, useDeviceMediaLibrary } from '../../../../lib/device-media-library';

function toMode(value: string | null): DeviceAiCreateMode {
  return value === 'video' ? 'video' : 'image';
}

export default function DeviceAiCreateSelectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  useDeviceMediaLibrary();

  const mode = toMode(searchParams.get('mode'));
  const prompt = searchParams.get('prompt') ?? '';
  const initialAssetId = searchParams.get('assetId') ?? '';
  const assets = useMemo(() => getAlbumAssets(mode === 'image' ? 'photo' : 'video'), [mode]);
  const [selectedAssetId, setSelectedAssetId] = useState(initialAssetId || assets[0]?.id || '');

  useEffect(() => {
    const fallbackAssetId = initialAssetId && assets.some((asset) => asset.id === initialAssetId)
      ? initialAssetId
      : assets[0]?.id || '';
    setSelectedAssetId((current) => (current && assets.some((asset) => asset.id === current) ? current : fallbackAssetId));
  }, [assets, initialAssetId]);

  if (!assets.length) {
    return (
      <Result
        status="404"
        title={mode === 'image' ? '暂无可选图片' : '暂无可选视频'}
        extra={
          <Link href={`/ai-create?mode=${mode}`}>
            <Button>返回创作</Button>
          </Link>
        }
      />
    );
  }

  const todayAssets = assets.filter((asset) => !asset.createdAt.startsWith('昨天'));
  const yesterdayAssets = assets.filter((asset) => asset.createdAt.startsWith('昨天'));
  const groupedAssets = [
    { key: 'today', title: '今天', assets: todayAssets },
    { key: 'yesterday', title: '昨天', assets: yesterdayAssets },
  ].filter((group) => group.assets.length);

  function confirmSelect() {
    const nextSearchParams = new URLSearchParams();
    nextSearchParams.set('mode', mode);
    nextSearchParams.set('assetId', selectedAssetId);
    if (prompt.trim()) {
      nextSearchParams.set('prompt', prompt.trim());
    }
    router.push(`/ai-create?${nextSearchParams.toString()}`);
  }

  return (
    <div className="device-page-stack">
      <div className="device-ai-select-page">
        <div className="device-photo-select-panel">
          {groupedAssets.map((group) => (
            <section key={group.key} className="device-photo-select-group">
              <div className="device-photo-select-date">
                <strong>{group.title}</strong>
              </div>
              <div className={`device-photo-select-grid${mode === 'video' ? ' video-mode' : ''}`}>
                {group.assets.map((asset, index) => {
                  const selected = selectedAssetId === asset.id;
                  return (
                    <button
                      key={asset.id}
                      type="button"
                      className={`device-ai-select-tile tone-${index % 6}${selected ? ' selected' : ''}${mode === 'video' ? ' video-mode' : ''}`}
                      onClick={() => setSelectedAssetId(asset.id)}
                      aria-pressed={selected}
                    >
                      <span className="device-ai-select-badge">{selected ? '已选' : mode === 'image' ? '图片' : '视频'}</span>
                      {asset.duration ? <em className="device-ai-select-duration">{asset.duration}</em> : null}
                      <span>{asset.previewLabel ?? asset.title}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="device-action-row">
          <Button type="primary" block onClick={confirmSelect} disabled={!selectedAssetId}>
            确定
          </Button>
          <Link href={`/ai-create?mode=${mode}${prompt ? `&prompt=${encodeURIComponent(prompt)}` : ''}`}>
            <Button block>返回</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
