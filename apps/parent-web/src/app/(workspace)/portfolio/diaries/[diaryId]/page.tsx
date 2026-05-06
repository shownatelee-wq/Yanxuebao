import { ParentStudyDiaryDetailScreen } from '../../../../../components/parent-portfolio-screens';

export default async function ParentStudyDiaryPage({
  params,
}: {
  params: Promise<{ diaryId: string }>;
}) {
  const { diaryId } = await params;
  return <ParentStudyDiaryDetailScreen diaryId={diaryId} />;
}
