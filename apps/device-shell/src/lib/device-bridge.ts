'use client';

import { getDeviceDataMode } from './api';

type BridgeStatus = 'mock-ready' | 'requires-hardware';

export type FaceLoginResult = {
  status: BridgeStatus;
  message: string;
  fallbackCode: string;
};

export type SosLocationResult = {
  status: BridgeStatus;
  latitude: number;
  longitude: number;
  accuracy: number;
  message: string;
};

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export const deviceBridge = {
  async simulateFaceLogin(): Promise<FaceLoginResult> {
    await delay(800);
    return {
      status: getDeviceDataMode() === 'api' ? 'requires-hardware' : 'mock-ready',
      message:
        getDeviceDataMode() === 'api'
          ? '当前已返回识别结果，后续可切换为硬件人脸 SDK 与活体校验。'
          : '当前已返回本地识别结果。',
      fallbackCode: 'device_demo_code',
    };
  },

  async requestSosLocation(): Promise<SosLocationResult> {
    await delay(600);
    return {
      status: getDeviceDataMode() === 'api' ? 'requires-hardware' : 'mock-ready',
      latitude: 22.543096,
      longitude: 114.057865,
      accuracy: 35,
      message:
        getDeviceDataMode() === 'api'
          ? '当前已返回定位结果，后续可切换为 GPS / 北斗采集与后台上报。'
          : '当前已返回本地定位坐标。',
    };
  },
};
