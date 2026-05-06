import { Suspense } from 'react';
import { ParentQuickTaskScreen } from '../../../../components/parent-quick-task-screen';
import { ParentRouteFallback } from '../../../../components/parent-route-fallback';

export default function ParentQuickTaskPage() {
  return (
    <Suspense fallback={<ParentRouteFallback label="正在进入 AI 创建任务" />}>
      <ParentQuickTaskScreen />
    </Suspense>
  );
}
