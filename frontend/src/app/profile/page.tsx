import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getMemberNumber } from '@/utils/irelandLocations';

export const dynamic = 'force-dynamic';

export default async function ProfileRedirectPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/profile');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.username) {
    redirect('/auth/setup-username');
  }

  const memberNum = getMemberNumber(user.id);
  redirect(`/member/${memberNum}`);
}
