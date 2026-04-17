import { TeamWorksPageContent } from '../../../../../components/tutor-pages';

export default async function TeamWorksPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  return <TeamWorksPageContent teamId={teamId} />;
}
