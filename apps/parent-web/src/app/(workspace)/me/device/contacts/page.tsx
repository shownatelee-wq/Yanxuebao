import { Suspense } from 'react';
import { ParentRouteFallback } from '../../../../../components/parent-route-fallback';
import { ParentDeviceFeatureScreen } from '../../../../../components/parent-device-screen';

export default function ParentDeviceContactsPage() {
  return (
    <Suspense fallback={<ParentRouteFallback label="正在进入通讯录" />}>
      <ParentDeviceFeatureScreen feature="contacts" />
    </Suspense>
  );
}
