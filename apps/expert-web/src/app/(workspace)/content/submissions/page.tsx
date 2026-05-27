import { redirect } from 'next/navigation';

export default function ContentSubmissionsRoute() {
  redirect('/challenges?tab=works');
}
