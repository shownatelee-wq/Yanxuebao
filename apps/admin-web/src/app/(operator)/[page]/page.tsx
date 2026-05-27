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
  'audit-records',
  'performance',
  'rental-orders',
  'finance-confirmations',
  'payment-center',
  'warehouses',
  'warehouse-permissions',
  'inventory',
  'devices',
  'sales-online',
  'sales-enterprise',
  'expert-entry-audits',
  'courses',
  'course-structure',
  'course-orders',
  'qa-records',
  'knowledge',
  'agents',
  'capability-elements',
  'capability-mappings',
  'question-bank',
  'growth-rules',
  'growth-goods',
  'assessment-settings',
  'master-agent-settings',
  'operation-logs',
]);

export default async function OperatorDynamicPage(props: { params: Promise<{ page: string }> }) {
  const { page } = await props.params;

  if (!operatorPageKeys.has(page)) {
    notFound();
  }

  return <OperatorPageRenderer page={page as OperatorPageKey} />;
}
