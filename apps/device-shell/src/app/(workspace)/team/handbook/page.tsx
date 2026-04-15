'use client';

import { DeviceLegacyTeamRedirect } from '../../../../lib/device-team-redirect';

export default function DeviceLegacyTeamHandbookPage() {
  return <DeviceLegacyTeamRedirect buildPath={(teamId) => (teamId ? `/team/${teamId}/handbook` : '/team')} />;
}
