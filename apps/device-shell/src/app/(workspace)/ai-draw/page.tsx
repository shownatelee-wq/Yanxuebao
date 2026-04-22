import { redirect } from 'next/navigation';

export default function DeviceAiDrawPage() {
  redirect('/ai-create?mode=image');
}
