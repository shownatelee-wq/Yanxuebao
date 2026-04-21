import { Suspense } from 'react';
import { ParentMobileApp } from '../../../components/parent-mobile-app';
import { ParentRouteFallback } from '../../../components/parent-route-fallback';

export default function ParentGrowthPage() {
  return (
    <Suspense fallback={<ParentRouteFallback />}>
      <ParentMobileApp initialTab="growth" />
    </Suspense>
  );
}
