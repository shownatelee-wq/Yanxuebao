import { Suspense } from 'react';
import { ParentRouteFallback } from '../../../../../components/parent-route-fallback';
import { ParentDeviceFeatureScreen } from '../../../../../components/parent-device-screen';

export default function ParentDevicePaymentCardPage() {
  return (
    <Suspense fallback={<ParentRouteFallback label="正在进入支付卡" />}>
      <ParentDeviceFeatureScreen feature="payment-card" />
    </Suspense>
  );
}
