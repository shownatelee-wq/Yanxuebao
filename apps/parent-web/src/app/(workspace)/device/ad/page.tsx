import { Suspense } from 'react';
import { ParentDeviceAdScreen } from '../../../../components/parent-device-ad-screen';
import { ParentRouteFallback } from '../../../../components/parent-route-fallback';

export default function ParentDeviceAdPage() {
  return (
    <Suspense fallback={<ParentRouteFallback label="正在进入研学宝广告页" />}>
      <ParentDeviceAdScreen />
    </Suspense>
  );
}
