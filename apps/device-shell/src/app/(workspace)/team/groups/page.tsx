'use client';

import { DeviceLegacyTeamRedirect } from '../../../../lib/device-team-redirect';

export default function DeviceLegacyTeamGroupsPage() {
  return <DeviceLegacyTeamRedirect buildPath={(teamId) => (teamId ? `/team/${teamId}/groups` : '/team')} />;
}
