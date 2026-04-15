'use client';

import { useParams } from 'next/navigation';
import { DeviceLegacyTeamRedirect } from '../../../../../lib/device-team-redirect';

export default function DeviceLegacyTeamGroupDetailPage() {
  const params = useParams<{ groupId: string }>();
  return <DeviceLegacyTeamRedirect buildPath={(teamId) => (teamId ? `/team/${teamId}/groups/${params.groupId}` : '/team')} />;
}
