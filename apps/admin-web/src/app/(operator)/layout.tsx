'use client';

import { Spin } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AdminShell } from '../../components/admin-shell';
import { getRoleHome, getStoredSession } from '../../lib/admin-auth';

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  const session = useMemo(() => getStoredSession(), []);

  useEffect(() => {
    if (!session) {
      router.replace('/login');
      return;
    }

    if (session.role !== 'operator') {
      router.replace(getRoleHome(session.role));
      return;
    }

    setReady(true);
  }, [pathname, router, session]);

  if (!ready || !session) {
    return (
      <main className="center-screen">
        <Spin size="large" />
      </main>
    );
  }

  return <AdminShell role="operator" session={session}>{children}</AdminShell>;
}
