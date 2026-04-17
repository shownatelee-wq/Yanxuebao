'use client';

import { Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getStoredSession } from '../lib/api';

export default function TutorRootPage() {
  const router = useRouter();

  useEffect(() => {
    if (getStoredSession()) {
      router.replace('/dashboard');
      return;
    }
    router.replace('/login');
  }, [router]);

  return (
    <main className="tutor-login">
      <div className="tutor-login-frame" style={{ padding: 40, display: 'grid', placeItems: 'center' }}>
        <Spin />
      </div>
    </main>
  );
}
