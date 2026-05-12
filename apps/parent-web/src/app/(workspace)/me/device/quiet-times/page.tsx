import { Suspense } from 'react';
import { ParentRouteFallback } from '../../../../../components/parent-route-fallback';
import { ParentDeviceFeatureScreen } from '../../../../../components/parent-device-screen';

export default function ParentDeviceQuietTimesPage() {
  return (
    <Suspense fallback={<ParentRouteFallback label="正在进入停用时间" />}>
      <ParentDeviceFeatureScreen feature="quiet-times" />
    </Suspense>
  );
}
