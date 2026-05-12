import { Suspense } from 'react';
import { ParentRouteFallback } from '../../../../components/parent-route-fallback';
import { ParentMobileApp } from '../../../../components/parent-mobile-app';

export default function ParentDeviceManagePage() {
  return (
    <Suspense fallback={<ParentRouteFallback label="正在进入设备管理" />}>
      <ParentMobileApp initialTab="device" />
    </Suspense>
  );
}
