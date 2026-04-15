'use client';

import { DeviceLegacyTeamRedirect } from '../../../../../lib/device-team-redirect';

export default function DeviceLegacyTeamPeerReviewPage() {
  return <DeviceLegacyTeamRedirect buildPath={(teamId) => (teamId ? `/team/${teamId}/reviews/peer` : '/team')} />;
}
