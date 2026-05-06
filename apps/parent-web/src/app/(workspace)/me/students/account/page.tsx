import { Suspense } from 'react';
import { ParentRouteFallback } from '../../../../../components/parent-route-fallback';
import { ParentStudentAccountScreen } from '../../../../../components/parent-students-screen';

export default function ParentStudentAccountPage() {
  return (
    <Suspense fallback={<ParentRouteFallback label="正在生成学员账号" />}>
      <ParentStudentAccountScreen />
    </Suspense>
  );
}
