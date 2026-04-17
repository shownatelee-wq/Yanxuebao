import { GroupsPageContent } from '../../../../../components/tutor-pages';

export default async function TeamGroupsPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  return <GroupsPageContent teamId={teamId} />;
}
