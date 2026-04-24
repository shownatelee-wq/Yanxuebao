import { redirect } from 'next/navigation';

export default function NewsPage() {
  redirect('/content?tab=news');
}
