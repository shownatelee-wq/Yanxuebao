import { Suspense } from 'react';
import { ParentRouteFallback } from '../../../../../components/parent-route-fallback';
import { ParentMessageComposeScreen } from '../../../../../components/parent-message-compose-screen';

export default function ParentMessageComposePage() {
  return (
    <Suspense fallback={<ParentRouteFallback label="正在进入消息发送" />}>
      <ParentMessageComposeScreen />
    </Suspense>
  );
}
