import { Suspense } from 'react';
import { ParentMobileApp } from '../../../components/parent-mobile-app';
import { ParentRouteFallback } from '../../../components/parent-route-fallback';

export default function ParentDiaryPage() {
  return (
    <Suspense fallback={<ParentRouteFallback />}>
      <ParentMobileApp initialTab="diary" />
    </Suspense>
  );
}
