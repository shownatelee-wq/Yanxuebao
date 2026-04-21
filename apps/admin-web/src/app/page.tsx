'use client';

import { Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getRoleHome, getStoredSession } from '../lib/admin-auth';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const session = getStoredSession();
    router.replace(session ? getRoleHome(session.role) : '/login');
  }, [router]);

  return (
    <main className="center-screen">
      <Spin size="large" />
    </main>
  );
}
