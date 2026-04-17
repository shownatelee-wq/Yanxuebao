import { TeamStudentsPageContent } from '../../../../../components/tutor-pages';

export default async function TeamStudentsPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  return <TeamStudentsPageContent teamId={teamId} />;
}
