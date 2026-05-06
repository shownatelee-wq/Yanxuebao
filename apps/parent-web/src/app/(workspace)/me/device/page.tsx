import { Suspense } from 'react';
import { ParentRouteFallback } from '../../../../components/parent-route-fallback';
import { ParentDeviceManagementScreen } from '../../../../components/parent-device-screen';

export default function ParentDeviceManagePage() {
  return (
    <Suspense fallback={<ParentRouteFallback label="正在进入设备管理" />}>
      <ParentDeviceManagementScreen />
    </Suspense>
  );
}
