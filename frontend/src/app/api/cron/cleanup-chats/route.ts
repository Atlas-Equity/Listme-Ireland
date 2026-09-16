import { NextRequest, NextResponse } from 'next/server';
import { purgeInactiveChats } from '@/utils/chatCleanup';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await purgeInactiveChats();
  return NextResponse.json({
    success: true,
    message: `Purged ${result.deletedConversations} inactive chats and ${result.deletedMessages} messages/logs.`,
    ...result,
  });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
