import React, { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import SetupUsernameForm from './SetupUsernameForm';

interface SetupUsernamePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const dynamic = 'force-dynamic';

export default async function SetupUsernamePage({ searchParams }: SetupUsernamePageProps) {
  const params = await searchParams;
  const nextParam = typeof params?.next === 'string' ? params.next : '/';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user already has a valid username
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.username) {
    redirect(nextParam);
  }

  // Generate suggested username based on Google name / email
  const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '';
  const emailPrefix = user.email ? user.email.split('@')[0] : '';
  const rawSuggested = (fullName ? fullName.replace(/\s+/g, '_') : emailPrefix)
    .replace(/[^a-zA-Z0-9_]/g, '')
    .toLowerCase()
    .slice(0, 15);

  const avatarUrl = user.user_metadata?.avatar_url || '';

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gray-50 dark:bg-black px-4 py-12">
      <Suspense fallback={
        <div className="w-full max-w-md p-8 bg-white dark:bg-[#181818] rounded-2xl border border-gray-200 dark:border-zinc-800 text-center text-sm text-gray-500">
          Loading...
        </div>
      }>
        <SetupUsernameForm
          initialEmail={user.email}
          suggestedUsername={rawSuggested}
          avatarUrl={avatarUrl}
          fullName={fullName}
        />
      </Suspense>
    </div>
  );
}
