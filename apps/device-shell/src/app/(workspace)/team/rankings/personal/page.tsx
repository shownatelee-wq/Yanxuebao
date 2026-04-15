'use client';

import { DeviceLegacyTeamRedirect } from '../../../../../lib/device-team-redirect';

export default function DeviceLegacyTeamPersonalRankingsPage() {
  return <DeviceLegacyTeamRedirect buildPath={(teamId) => (teamId ? `/team/${teamId}/rankings/personal` : '/team')} />;
}
