import { Suspense } from 'react';
import { ParentRouteFallback } from '../../../../../components/parent-route-fallback';
import { ParentDeviceScanScreen } from '../../../../../components/parent-device-screen';

export default function ParentDeviceScanPage() {
  return (
    <Suspense fallback={<ParentRouteFallback label="正在打开扫码绑定" />}>
      <ParentDeviceScanScreen />
    </Suspense>
  );
}
