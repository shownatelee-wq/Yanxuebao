'use client';

import { DeviceLegacyTeamRedirect } from '../../../../lib/device-team-redirect';

export default function DeviceLegacyTeamRolesPage() {
  return <DeviceLegacyTeamRedirect buildPath={(teamId) => (teamId ? `/team/${teamId}/roles` : '/team')} />;
}
