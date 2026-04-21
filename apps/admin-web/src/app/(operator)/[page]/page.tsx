import { notFound } from 'next/navigation';
import { OperatorPageRenderer } from '../../../components/admin-pages';
import type { OperatorPageKey } from '../../../lib/navigation';

const operatorPageKeys = new Set<string>([
  'dashboard',
  'organizations',
  'mentors',
  'team-assignments',
  'team-tasks',
  'team-photos',
  'students',
  'sos',
  'bases',
  'task-library',
  'task-types',
  'task-builder',
  'task-import',
  'part-timers',
  'audits',
  'performance',
  'rental-orders',
  'inventory',
  'devices',
  'sales-online',
  'sales-enterprise',
  'courses',
  'qa-records',
  'knowledge',
  'agents',
  'capability-elements',
  'question-bank',
  'growth-rules',
  'growth-goods',
  'assessment-settings',
]);

export default async function OperatorDynamicPage(props: { params: Promise<{ page: string }> }) {
  const { page } = await props.params;

  if (!operatorPageKeys.has(page)) {
    notFound();
  }

  return <OperatorPageRenderer page={page as OperatorPageKey} />;
}
