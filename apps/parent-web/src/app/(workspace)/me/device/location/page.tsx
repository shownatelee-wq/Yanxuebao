import { Suspense } from 'react';
import { ParentRouteFallback } from '../../../../../components/parent-route-fallback';
import { ParentDeviceFeatureScreen } from '../../../../../components/parent-device-screen';

export default function ParentDeviceLocationPage() {
  return (
    <Suspense fallback={<ParentRouteFallback label="正在进入位置与轨迹" />}>
      <ParentDeviceFeatureScreen feature="location" />
    </Suspense>
  );
}
