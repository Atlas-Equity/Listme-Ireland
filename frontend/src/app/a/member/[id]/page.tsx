import { redirect } from 'next/navigation';

export default async function TradeMeMemberRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/member/${id}`);
}
