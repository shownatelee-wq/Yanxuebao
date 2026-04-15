'use client';

import { DeviceLegacyTeamRedirect } from '../../../../../lib/device-team-redirect';

export default function DeviceLegacyTeamSelfReviewPage() {
  return <DeviceLegacyTeamRedirect buildPath={(teamId) => (teamId ? `/team/${teamId}/reviews/self` : '/team')} />;
}
