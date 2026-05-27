'use client';

import { ExpertWorkspaceShell } from '../../components/expert-shell';

export default function ExpertWorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <ExpertWorkspaceShell>{children}</ExpertWorkspaceShell>;
}
