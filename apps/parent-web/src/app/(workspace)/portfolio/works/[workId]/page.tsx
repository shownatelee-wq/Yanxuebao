import { ParentPortfolioWorkDetailScreen } from '../../../../../components/parent-portfolio-screens';

export default async function ParentPortfolioWorkPage({
  params,
}: {
  params: Promise<{ workId: string }>;
}) {
  const { workId } = await params;
  return <ParentPortfolioWorkDetailScreen workId={workId} />;
}
