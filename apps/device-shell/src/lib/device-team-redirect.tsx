'use client';

import { Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getCurrentJoinedTeam } from './device-team-data';

export function DeviceLegacyTeamRedirect({
  buildPath,
}: {
  buildPath: (teamId: string | null) => string;
}) {
  const router = useRouter();

  useEffect(() => {
    const team = getCurrentJoinedTeam();
    router.replace(buildPath(team?.id ?? null));
  }, [buildPath, router]);

  return (
    <div className="device-page-stack" style={{ minHeight: 240, display: 'grid', placeItems: 'center' }}>
      <Spin size="small" />
    </div>
  );
}
