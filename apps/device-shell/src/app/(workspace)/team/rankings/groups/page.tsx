'use client';

import { DeviceLegacyTeamRedirect } from '../../../../../lib/device-team-redirect';

export default function DeviceLegacyTeamGroupRankingsPage() {
  return <DeviceLegacyTeamRedirect buildPath={(teamId) => (teamId ? `/team/${teamId}/rankings/groups` : '/team')} />;
}
