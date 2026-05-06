import { Suspense } from 'react';
import { ParentRouteFallback } from '../../../../components/parent-route-fallback';
import { ParentStudentsScreen } from '../../../../components/parent-students-screen';

export default function ParentStudentsManagePage() {
  return (
    <Suspense fallback={<ParentRouteFallback label="正在进入学员管理" />}>
      <ParentStudentsScreen />
    </Suspense>
  );
}
