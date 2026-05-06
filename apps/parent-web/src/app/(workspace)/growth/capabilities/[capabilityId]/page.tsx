import { Suspense } from 'react';
import { ParentCapabilityDetailScreen } from '../../../../../components/parent-capability-detail-screen';
import { ParentRouteFallback } from '../../../../../components/parent-route-fallback';

export default function ParentCapabilityDetailPage() {
  return (
    <Suspense fallback={<ParentRouteFallback label="正在进入能力详情" />}>
      <ParentCapabilityDetailScreen />
    </Suspense>
  );
}
