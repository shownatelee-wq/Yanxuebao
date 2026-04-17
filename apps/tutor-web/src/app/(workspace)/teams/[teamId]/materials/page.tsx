import { TeamMaterialsPageContent } from '../../../../../components/tutor-pages';

export default async function TeamMaterialsPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  return <TeamMaterialsPageContent teamId={teamId} />;
}
