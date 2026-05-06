import { ParentPortfolioAiDetailScreen } from '../../../../../components/parent-portfolio-screens';

export default async function ParentPortfolioAiPage({
  params,
}: {
  params: Promise<{ recordId: string }>;
}) {
  const { recordId } = await params;
  return <ParentPortfolioAiDetailScreen recordId={recordId} />;
}
