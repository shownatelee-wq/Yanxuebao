import { ParentPortfolioReportDetailScreen } from '../../../../../components/parent-portfolio-screens';

export default async function ParentPortfolioReportPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  return <ParentPortfolioReportDetailScreen reportId={reportId} />;
}
