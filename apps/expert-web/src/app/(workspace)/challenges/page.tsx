import { redirect } from 'next/navigation';

export default function ChallengesPage() {
  redirect('/content?tab=challenges');
}
