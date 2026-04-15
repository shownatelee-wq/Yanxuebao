'use client';

import { useParams } from 'next/navigation';
import { DeviceLegacyTeamRedirect } from '../../../../../../lib/device-team-redirect';

export default function DeviceLegacyHandbookMaterialDetailPage() {
  const params = useParams<{ materialId: string }>();
  return <DeviceLegacyTeamRedirect buildPath={(teamId) => (teamId ? `/team/${teamId}/handbook/materials/${params.materialId}` : '/team')} />;
}
