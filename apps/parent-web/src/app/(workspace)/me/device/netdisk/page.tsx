import { Suspense } from 'react';
import { ParentRouteFallback } from '../../../../../components/parent-route-fallback';
import { ParentDeviceFeatureScreen } from '../../../../../components/parent-device-screen';

export default function ParentDeviceNetDiskPage() {
  return (
    <Suspense fallback={<ParentRouteFallback label="正在进入网盘" />}>
      <ParentDeviceFeatureScreen feature="netdisk" />
    </Suspense>
  );
}
