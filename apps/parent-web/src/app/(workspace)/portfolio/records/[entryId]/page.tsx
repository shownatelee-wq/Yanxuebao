import { ParentPortfolioRecordDetailScreen } from '../../../../../components/parent-portfolio-screens';

export default async function ParentPortfolioRecordPage({
  params,
}: {
  params: Promise<{ entryId: string }>;
}) {
  const { entryId } = await params;
  return <ParentPortfolioRecordDetailScreen entryId={entryId} />;
}
