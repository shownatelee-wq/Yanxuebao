import { Suspense } from 'react';
import { ParentAssessmentScreen } from '../../../../components/parent-assessment-screen';
import { ParentRouteFallback } from '../../../../components/parent-route-fallback';

export default function ParentAssessmentPage() {
  return (
    <Suspense fallback={<ParentRouteFallback label="正在进入家长评测" />}>
      <ParentAssessmentScreen />
    </Suspense>
  );
}
