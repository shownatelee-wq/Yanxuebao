import { Suspense } from 'react';
import { ParentRouteFallback } from '../../../../components/parent-route-fallback';
import { ParentTalentTestScreen } from '../../../../components/parent-talent-test-screen';

export default function ParentTalentTestPage() {
  return (
    <Suspense fallback={<ParentRouteFallback label="正在进入天赋测试" />}>
      <ParentTalentTestScreen />
    </Suspense>
  );
}
