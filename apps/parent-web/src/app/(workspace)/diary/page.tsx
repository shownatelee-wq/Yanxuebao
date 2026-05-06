import { redirect } from 'next/navigation';

export default function ParentDiaryPage() {
  redirect('/portfolio?panel=diary');
}
