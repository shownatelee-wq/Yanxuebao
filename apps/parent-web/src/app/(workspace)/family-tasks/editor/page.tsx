import { Suspense } from 'react';
import { ParentTaskEditorScreen } from '../../../../components/parent-task-editor-screen';
import { ParentRouteFallback } from '../../../../components/parent-route-fallback';

export default function ParentTaskEditorPage() {
  return (
    <Suspense fallback={<ParentRouteFallback label="正在进入任务编辑页" />}>
      <ParentTaskEditorScreen />
    </Suspense>
  );
}
