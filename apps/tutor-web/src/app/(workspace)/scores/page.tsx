'use client';

import { Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ScoresCompatPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/works');
  }, [router]);

  return (
    <div className="tutor-page">
      <div className="tutor-card" style={{ display: 'grid', placeItems: 'center', minHeight: 180 }}>
        <Spin />
      </div>
    </div>
  );
}
