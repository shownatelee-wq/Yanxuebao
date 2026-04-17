import { TeamAssistantsPageContent } from '../../../../../components/tutor-pages';

export default async function TeamAssistantsPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  return <TeamAssistantsPageContent teamId={teamId} />;
}
