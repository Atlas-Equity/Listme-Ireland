import { redirect } from 'next/navigation';
import { getMemberNumber } from '@/utils/irelandLocations';

export default async function TradeMeMemberRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const target = isUuid ? getMemberNumber(id) : id;
  redirect(`/member/${target}`);
}
