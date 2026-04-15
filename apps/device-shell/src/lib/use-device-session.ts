'use client';

import { useEffect, useState } from 'react';
import { DEVICE_SESSION_EVENT, getStoredSession, type DeviceSession } from './api';

type SessionStatus = 'hydrating' | 'authenticated' | 'unauthenticated';

export function useDeviceSession() {
  const [status, setStatus] = useState<SessionStatus>('hydrating');
  const [session, setSession] = useState<DeviceSession | null>(null);

  useEffect(() => {
    function syncSession() {
      const nextSession = getStoredSession();
      setSession(nextSession);
      setStatus(nextSession ? 'authenticated' : 'unauthenticated');
    }

    syncSession();

    window.addEventListener('storage', syncSession);
    window.addEventListener(DEVICE_SESSION_EVENT, syncSession);

    return () => {
      window.removeEventListener('storage', syncSession);
      window.removeEventListener(DEVICE_SESSION_EVENT, syncSession);
    };
  }, []);

  return { status, session };
}
