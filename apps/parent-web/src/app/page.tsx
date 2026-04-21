'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredSession } from '../lib/api';

export default function ParentHomeRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getStoredSession() ? '/home' : '/login');
  }, [router]);

  return null;
}

