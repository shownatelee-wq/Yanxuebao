import { Suspense } from 'react';
import { ParentGrowthPathScreen } from '../../../../components/parent-growth-path-screen';
import { ParentRouteFallback } from '../../../../components/parent-route-fallback';

export default function ParentGrowthPathPage() {
  return (
    <Suspense fallback={<ParentRouteFallback label="正在生成成长路径" />}>
      <ParentGrowthPathScreen />
    </Suspense>
  );
}
