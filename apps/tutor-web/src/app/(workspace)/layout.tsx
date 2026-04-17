'use client';

import { TutorWorkspaceShell } from '../../components/tutor-shell';

export default function TutorWorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <TutorWorkspaceShell>{children}</TutorWorkspaceShell>;
}
