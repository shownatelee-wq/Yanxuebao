'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredSession } from '../lib/api';

export default function ExpertHomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getStoredSession() ? '/dashboard' : '/login');
  }, [router]);

  return null;
}
