import { notFound } from 'next/navigation';
import { CityWorkbenchPageRenderer } from '../../../components/admin-pages';
import type { CityPageKey } from '../../../lib/navigation';

const cityPageKeys = new Set<string>(['bases', 'tasks', 'audits', 'performance']);

export default async function CityWorkbenchPage(props: { params: Promise<{ page: string }> }) {
  const { page } = await props.params;

  if (!cityPageKeys.has(page)) {
    notFound();
  }

  return <CityWorkbenchPageRenderer page={page as CityPageKey} />;
}
