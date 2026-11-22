import { NextRequest, NextResponse } from 'next/server';
import {
  processWhatsAppWebhookPayload,
  verifyMetaWebhookSignature,
  verifyWhatsAppWebhookToken,
} from '@/app/lib/whatsappWebhook.server';

export const dynamic = 'force-dynamic';

/**
 * Meta WhatsApp Business Cloud API Webhook Verification (GET)
 * Meta calls: ?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const mode = sp.get('hub.mode');
  const token = sp.get('hub.verify_token');
  const challenge = sp.get('hub.challenge');

  if (mode === 'subscribe' && challenge && verifyWhatsAppWebhookToken(token)) {
    return new NextResponse(challenge, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  return NextResponse.json(
    { error: 'Échec de vérification du webhook WhatsApp.' },
    { status: 403 }
  );
}

/**
 * Meta WhatsApp Business Cloud API Event Receiver (POST)
 * Receives delivery statuses (sent, delivered, read, failed) and incoming messages.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signatureHeader = req.headers.get('x-hub-signature-256');
    const sigCheck = verifyMetaWebhookSignature(rawBody, signatureHeader);

    if (!sigCheck.ok) {
      return NextResponse.json(
        { error: sigCheck.reason || 'Signature webhook invalide.' },
        { status: 401 }
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Corps JSON invalide.' }, { status: 400 });
    }

    const result = await processWhatsAppWebhookPayload(parsed, sigCheck.enforced);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.ignoredReason || 'Payload webhook non pris en charge.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        processedStatuses: result.processedStatuses,
        processedMessages: result.processedMessages,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[API /webhooks/whatsapp POST] error:', err);
    return NextResponse.json(
      { error: 'Erreur interne lors du traitement du webhook WhatsApp.' },
      { status: 500 }
    );
  }
}
