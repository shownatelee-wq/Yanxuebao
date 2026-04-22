'use client';

import { Result, Button } from 'antd';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { useDeviceAiCreateSnapshot } from '../../../../../lib/device-ai-create-state';

export default function DeviceAiCreateChatRedirectPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const snapshot = useDeviceAiCreateSnapshot();
  const session = useMemo(
    () => snapshot.sessions.find((item) => item.id === params.sessionId) ?? null,
    [params.sessionId, snapshot.sessions],
  );

  useEffect(() => {
    if (!session) {
      return;
    }

    router.replace(session.mode === 'image' ? `/ai-draw/chat/${session.id}` : `/ai-video/chat/${session.id}`);
  }, [router, session]);

  if (!session) {
    return <Result status="404" title="未找到创作会话" extra={<Link href="/ai-create"><Button>返回AI创作</Button></Link>} />;
  }

  return null;
}
