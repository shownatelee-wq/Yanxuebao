import { redirect } from 'next/navigation';

export default function ParentAiRecordsLegacyPage() {
  redirect('/portfolio?panel=qa');
}
