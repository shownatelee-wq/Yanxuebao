import { Suspense } from 'react';
import { ParentRouteFallback } from '../../../../../components/parent-route-fallback';
import { ParentStudentEditorScreen } from '../../../../../components/parent-students-screen';

export default function ParentStudentEditorPage() {
  return (
    <Suspense fallback={<ParentRouteFallback label="正在进入学员资料页" />}>
      <ParentStudentEditorScreen />
    </Suspense>
  );
}
