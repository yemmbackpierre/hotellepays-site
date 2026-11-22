import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/app/lib/adminAuth';
import { getRequestPublicOrigin } from '@/app/lib/reservationVerification.server';
import {
  getWhatsAppWebhookVerifyTokenMeta,
  readWhatsAppWebhookEvents,
} from '@/app/lib/whatsappWebhook.server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const origin =
    getRequestPublicOrigin(req) ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    'https://hotellepays.com';

  const cleanOrigin = origin.replace(/\/+$/, '');
  const webhookPath = '/api/webhooks/whatsapp/';
  const callbackUrl = `${cleanOrigin}${webhookPath}`;
  const tokenMeta = getWhatsAppWebhookVerifyTokenMeta();
  const events = await readWhatsAppWebhookEvents(40);

  return NextResponse.json({
    ok: true,
    callbackUrl,
    webhookPath,
    verifyToken: tokenMeta.token,
    verifyTokenSource: tokenMeta.source,
    appSecretConfigured: Boolean(process.env.WHATSAPP_APP_SECRET?.trim()),
    events,
  });
}
