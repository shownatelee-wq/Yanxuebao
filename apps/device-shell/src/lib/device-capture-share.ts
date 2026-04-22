'use client';

import { useEffect, useState } from 'react';
import {
  clearPendingForward,
  getAlbumAssets,
  getMediaAssetById,
  getPendingForward,
  saveMediaAsset,
  savePendingForward,
  type DeviceMediaAsset,
} from './device-media-library';
import { normalizeDeviceTimeValue } from './device-time';

const DEVICE_CAPTURE_EVENT = 'yanxuebao:device-capture-share-wrapper-change';

export type DeviceCaptureAsset = Omit<DeviceMediaAsset, 'createdAt' | 'createdAtValue' | 'albumTab' | 'sourceApp' | 'canShareToTask'> &
  Partial<Pick<DeviceMediaAsset, 'createdAt' | 'createdAtValue' | 'albumTab' | 'sourceApp' | 'canShareToTask'>> & {
    capturedAt?: string;
    target?: 'expert' | 'model';
    agentId?: string;
  };

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function emitChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(DEVICE_CAPTURE_EVENT));
  }
}

export function saveCaptureAsset(asset: DeviceCaptureAsset) {
  const createdAt = asset.createdAt ?? asset.capturedAt ?? '刚刚';
  saveMediaAsset({
    ...asset,
    type: asset.type,
    createdAt,
    createdAtValue: asset.createdAtValue ?? normalizeDeviceTimeValue(createdAt),
    albumTab: asset.albumTab ?? (asset.type === '视频' || asset.type === 'AI视频' ? 'video' : asset.type === '截图' ? 'screenshot' : 'photo'),
    sourceApp: asset.sourceApp ?? 'capture',
    canShareToTask: asset.canShareToTask ?? true,
  });
  emitChange();
}

export function getCaptureAssets() {
  return clone(
    getAlbumAssets().filter((item) => item.albumTab === 'photo' || item.albumTab === 'video'),
  );
}

export function useCaptureAssets() {
  const [assets, setAssets] = useState<DeviceCaptureAsset[]>(() => getCaptureAssets());

  useEffect(() => {
    function sync() {
      setAssets(getCaptureAssets());
    }

    sync();
    window.addEventListener('storage', sync);
    window.addEventListener(DEVICE_CAPTURE_EVENT, sync);
    window.addEventListener('yanxuebao:device-media-library-change', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(DEVICE_CAPTURE_EVENT, sync);
      window.removeEventListener('yanxuebao:device-media-library-change', sync);
    };
  }, []);

  return assets;
}

export function saveCaptureShare(asset: DeviceCaptureAsset, target: 'expert' | 'model', agentId?: string) {
  saveCaptureAsset(asset);
  const timestamp = new Date().toISOString();
  savePendingForward({
    assetId: asset.id,
    target,
    agentId,
    createdAt: timestamp,
    createdAtValue: timestamp,
  });
  emitChange();
}

export function getCaptureShare() {
  const pendingForward = getPendingForward();
  if (!pendingForward) {
    return null;
  }

  const asset = getMediaAssetById(pendingForward.assetId);
  if (!asset) {
    return null;
  }

  return {
    ...asset,
    target: pendingForward.target,
    agentId: pendingForward.agentId,
  };
}

export function clearCaptureShare() {
  clearPendingForward();
  emitChange();
}

export function useCaptureShare() {
  const [share, setShare] = useState<ReturnType<typeof getCaptureShare>>(() => getCaptureShare());

  useEffect(() => {
    function sync() {
      setShare(getCaptureShare());
    }

    sync();
    window.addEventListener('storage', sync);
    window.addEventListener(DEVICE_CAPTURE_EVENT, sync);
    window.addEventListener('yanxuebao:device-media-library-change', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(DEVICE_CAPTURE_EVENT, sync);
      window.removeEventListener('yanxuebao:device-media-library-change', sync);
    };
  }, []);

  return share;
}
