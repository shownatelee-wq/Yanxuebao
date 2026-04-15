'use client';

import { useEffect, useState } from 'react';
import { demoAlbumItems, type DemoAlbumItem } from './device-demo-data';

const DEVICE_CAPTURE_ASSETS_KEY = 'yanxuebao_device_capture_assets';
const DEVICE_CAPTURE_SHARE_KEY = 'yanxuebao_device_capture_share';
const DEVICE_CAPTURE_EVENT = 'yanxuebao:device-capture-change';

export type DeviceCaptureAsset = DemoAlbumItem & {
  summary: string;
  target?: 'expert' | 'model';
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function buildInitialAssets(): DeviceCaptureAsset[] {
  return demoAlbumItems.map((item) => ({
    ...item,
    summary: item.type === '照片' ? '适合发送给专家进行现场观察分析。' : '适合发送给专家或大模型做视频分析。',
  }));
}

function readAssets() {
  if (typeof window === 'undefined') {
    return buildInitialAssets();
  }

  const raw = window.sessionStorage.getItem(DEVICE_CAPTURE_ASSETS_KEY);
  if (!raw) {
    const initial = buildInitialAssets();
    window.sessionStorage.setItem(DEVICE_CAPTURE_ASSETS_KEY, JSON.stringify(initial));
    return initial;
  }

  return JSON.parse(raw) as DeviceCaptureAsset[];
}

function writeAssets(nextAssets: DeviceCaptureAsset[]) {
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(DEVICE_CAPTURE_ASSETS_KEY, JSON.stringify(nextAssets));
    window.dispatchEvent(new Event(DEVICE_CAPTURE_EVENT));
  }
}

export function saveCaptureAsset(asset: DeviceCaptureAsset) {
  const assets = readAssets().filter((item) => item.id !== asset.id);
  writeAssets([asset, ...assets]);
}

export function getCaptureAssets() {
  return clone(readAssets());
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
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(DEVICE_CAPTURE_EVENT, sync);
    };
  }, []);

  return assets;
}

export function saveCaptureShare(asset: DeviceCaptureAsset, target: 'expert' | 'model') {
  if (typeof window !== 'undefined') {
    const payload = { ...asset, target };
    window.sessionStorage.setItem(DEVICE_CAPTURE_SHARE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new Event(DEVICE_CAPTURE_EVENT));
  }
}

export function getCaptureShare() {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.sessionStorage.getItem(DEVICE_CAPTURE_SHARE_KEY);
  return raw ? (JSON.parse(raw) as DeviceCaptureAsset) : null;
}

export function useCaptureShare() {
  const [share, setShare] = useState<DeviceCaptureAsset | null>(() => getCaptureShare());

  useEffect(() => {
    function sync() {
      setShare(getCaptureShare());
    }

    sync();
    window.addEventListener('storage', sync);
    window.addEventListener(DEVICE_CAPTURE_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(DEVICE_CAPTURE_EVENT, sync);
    };
  }, []);

  return share;
}
