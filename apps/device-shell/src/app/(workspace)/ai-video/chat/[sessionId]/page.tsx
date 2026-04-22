'use client';

import { useParams } from 'next/navigation';
import { DeviceAiGenerateChatScreen } from '../../../../../components/device-ai-generate-chat-screen';

export default function DeviceAiVideoChatPage() {
  const params = useParams<{ sessionId: string }>();
  return <DeviceAiGenerateChatScreen sessionId={params.sessionId} mode="video" />;
}
