import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/app/lib/adminAuth';
import { sendTestConfirmationEmail } from '@/app/lib/email.server';
import type { EmailTemplatesConfig } from '@/app/lib/emailTemplates';

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const templateType = body?.templateType === 'admin' ? 'admin' : 'guest';
    const recipientEmail =
      typeof body?.recipientEmail === 'string' && body.recipientEmail.trim()
        ? body.recipientEmail.trim()
        : session.email;

    if (!recipientEmail || !/\S+@\S+\.\S+/.test(recipientEmail)) {
      return NextResponse.json(
        { error: 'Veuillez saisir une adresse e-mail de destination valide.' },
        { status: 400 }
      );
    }

    const templateConfig =
      body?.templateConfig && typeof body.templateConfig === 'object'
        ? (body.templateConfig as Partial<EmailTemplatesConfig>)
        : null;

    const result = await sendTestConfirmationEmail({
      templateType,
      recipientEmail,
      templateConfig,
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.error || "Échec de l'envoi de l'e-mail de test.",
          result,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error('[API /admin/email-test POST] error:', err);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'envoi du test." },
      { status: 500 }
    );
  }
}
