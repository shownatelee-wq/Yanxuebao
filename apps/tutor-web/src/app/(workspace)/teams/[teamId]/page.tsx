import { TeamDetailPageContent } from '../../../../components/tutor-pages';

export default async function TeamDetailByIdPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  return <TeamDetailPageContent teamId={teamId} />;
}
