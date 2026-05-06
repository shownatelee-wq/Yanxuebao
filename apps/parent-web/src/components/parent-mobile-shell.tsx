'use client';

import '@ant-design/v5-patch-for-react-19';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Select } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { getStoredSession } from '../lib/api';
import { type ParentStudent } from '../lib/parent-store';

export function useParentSessionReady() {
  const router = useRouter();
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const session = getStoredSession();
    if (!session) {
      router.replace('/login');
      return;
    }
    setSessionReady(true);
  }, [router]);

  return sessionReady;
}

export function ParentPhoneFrame({ children }: { children: ReactNode }) {
  return (
    <main className="parent-app-bg">
      <div className="parent-phone">{children}</div>
    </main>
  );
}

export function ParentStudentSwitcher({
  students,
  selectedStudentId,
  onChange,
  variant = 'header',
}: {
  students: ParentStudent[];
  selectedStudentId: string | null;
  onChange: (studentId: string) => void;
  variant?: 'header' | 'prominent';
}) {
  if (!students.length) {
    return <span className="parent-header-placeholder" aria-hidden />;
  }

  return (
    <div className={`parent-student-switch ${variant === 'prominent' ? 'prominent' : ''}`}>
      <Select
        value={selectedStudentId ?? students[0]?.id}
        onChange={onChange}
        options={students.map((student) => ({ label: `${student.name} · ${student.yxbId}`, value: student.id }))}
        variant="borderless"
        className={`parent-student-select ${variant === 'prominent' ? 'prominent' : ''}`}
      />
    </div>
  );
}

export function ParentSubpageShell({
  title,
  subtitle,
  onBack,
  rightSlot,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
  rightSlot?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="parent-subpage-shell">
      <header className="parent-subpage-header">
        <Button aria-label="返回" icon={<ArrowLeftOutlined />} shape="circle" onClick={onBack} />
        <div className="parent-subpage-title">
          {subtitle ? <span>{subtitle}</span> : null}
          <strong>{title}</strong>
        </div>
        {rightSlot ?? <span className="parent-subpage-spacer" aria-hidden />}
      </header>
      <div className="parent-subpage-content">{children}</div>
      {footer ? <div className="parent-editor-footer">{footer}</div> : null}
    </div>
  );
}
