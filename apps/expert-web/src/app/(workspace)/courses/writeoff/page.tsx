import { redirect } from 'next/navigation';

export default function CourseWriteOffRoute() {
  redirect('/me/orders?tab=verify');
}
