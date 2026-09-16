'use server';

export interface DiscordTicketPayload {
  id: string;
  subject: string;
  category: string;
  userDisplayName: string;
  userEmail?: string;
  referenceId?: string;
  initialMessage: string;
  createdAt: string;
}

export async function sendDiscordTicketNotificationAction(ticket: DiscordTicketPayload) {
  const webhookUrl = process.env.DISCORD_SUPPORT_WEBHOOK_URL;
  if (!webhookUrl) {
    return { success: false, reason: 'DISCORD_SUPPORT_WEBHOOK_URL not configured' };
  }

  const roleId = process.env.DISCORD_SUPPORT_ROLE_ID;
  const roleMention = roleId ? `<@&${roleId}>` : '@here';

  const embed = {
    title: `🚨 New Support Ticket: #${ticket.id}`,
    description: `**Subject:** ${ticket.subject}\n**Category:** ${ticket.category}`,
    color: 0x10b981,
    fields: [
      {
        name: 'Submitted By',
        value: `${ticket.userDisplayName} (${ticket.userEmail || 'No email'})`,
        inline: true,
      },
      {
        name: 'Reference',
        value: ticket.referenceId || 'None',
        inline: true,
      },
      {
        name: 'Initial Message',
        value: ticket.initialMessage.length > 1000 ? `${ticket.initialMessage.slice(0, 1000)}...` : ticket.initialMessage,
      },
      {
        name: 'Assigned Support Officers',
        value: '• **sahleyis**\n• **Quinn**',
        inline: true,
      },
      {
        name: 'Direct Action',
        value: '[Respond in Help Centre](https://www.listme.ie/help#tickets)',
        inline: true,
      },
    ],
    footer: {
      text: 'ListMe Support Dispatch • Official Ticketing',
    },
    timestamp: new Date().toISOString(),
  };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `${roleMention} **New Support Ticket Opened!** Please review and respond in the Support Desk.`,
        embeds: [embed],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: errText };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}
