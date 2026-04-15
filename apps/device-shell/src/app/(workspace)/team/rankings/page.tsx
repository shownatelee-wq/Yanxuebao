'use client';

import { DeviceLegacyTeamRedirect } from '../../../../lib/device-team-redirect';

export default function DeviceLegacyTeamRankingsPage() {
  return <DeviceLegacyTeamRedirect buildPath={(teamId) => (teamId ? `/team/${teamId}/rankings` : '/team')} />;
}
