import { redirect } from 'next/navigation';

export default function CourseOrdersRoute() {
  redirect('/me/orders?tab=orders');
}
