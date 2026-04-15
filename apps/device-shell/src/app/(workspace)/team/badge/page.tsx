'use client';

import { DeviceLegacyTeamRedirect } from '../../../../lib/device-team-redirect';

export default function DeviceLegacyTeamBadgePage() {
  return <DeviceLegacyTeamRedirect buildPath={(teamId) => (teamId ? `/team/${teamId}/badge` : '/team')} />;
}
