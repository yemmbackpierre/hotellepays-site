'use client';

import React, { useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Code2,
  Copy,
  Eye,
  Loader2,
  Mail,
  Monitor,
  RotateCcw,
  Send,
  Smartphone,
} from 'lucide-react';
import {
  EMAIL_TEMPLATE_PLACEHOLDERS,
  type EmailTemplateConfig,
  type EmailTemplatesConfig,
  SAMPLE_RESERVATION_FOR_PREVIEW,
  getDefaultEmailTemplatesConfig,
  renderEmailFromTemplate,
} from '@/app/lib/emailTemplates';

interface EmailTemplatesEditorProps {
  value: EmailTemplatesConfig;
  footerContact: {
    email: string;
    phone: string;
    address: string;
  };
  adminEmail: string;
  onChange: (next: EmailTemplatesConfig) => void;
  onNotify: (type: 'success' | 'error', message: string) => void;
}

const inputClass =
  'w-full rounded-lg bg-slate-950 border border-slate-700/80 text-slate-100 placeholder-slate-500 px-3 py-2 text-sm focus:outline-none focus:border-amber-500';
const labelClass = 'block text-xs font-medium text-slate-300 mb-1';
const cardClass = 'rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-4';

export default function EmailTemplatesEditor({
  value,
  footerContact,
  adminEmail,
  onChange,
  onNotify,
}: EmailTemplatesEditorProps) {
  const [activeTab, setActiveTab] = useState<'guest' | 'admin'>('guest');
  const [testTarget, setTestTarget] = useState<'guest' | 'admin'>('guest');
  const [testRecipient, setTestRecipient] = useState<string>(
    adminEmail || footerContact.email || ''
  );
  const [sendingTest, setSendingTest] = useState(false);
  const [testStatus, setTestStatus] = useState<{
    ok: boolean;
    mode?: string;
    recipientEmail?: string;
    subject?: string;
    messageId?: string;
    message: string;
  } | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const customHtmlRef = useRef<HTMLTextAreaElement | null>(null);
  const introTextRef = useRef<HTMLTextAreaElement | null>(null);

  const defaults = useMemo(() => getDefaultEmailTemplatesConfig(), []);
  const currentTemplate: EmailTemplateConfig = value[activeTab];

  const handleTabSwitch = (nextTab: 'guest' | 'admin') => {
    setActiveTab(nextTab);
    setTestTarget(nextTab);
  };

  const updateCurrentTemplate = (patch: Partial<EmailTemplateConfig>) => {
    onChange({
      ...value,
      [activeTab]: {
        ...value[activeTab],
        ...patch,
      },
    });
  };

  const handleResetActiveTemplate = () => {
    onChange({
      ...value,
      [activeTab]: structuredClone(defaults[activeTab]),
    });
    onNotify(
      'success',
      `Modèle "${activeTab === 'guest' ? 'Reçu Client' : 'Notification Admin'}" réinitialisé par défaut.`
    );
  };

  const handleInsertToken = async (token: string) => {
    const targetRef = currentTemplate.useCustomHtml ? customHtmlRef.current : introTextRef.current;
    const fieldKey: 'customHtml' | 'introText' = currentTemplate.useCustomHtml
      ? 'customHtml'
      : 'introText';

    if (targetRef) {
      const start = targetRef.selectionStart ?? currentTemplate[fieldKey].length;
      const end = targetRef.selectionEnd ?? currentTemplate[fieldKey].length;
      const before = currentTemplate[fieldKey].slice(0, start);
      const after = currentTemplate[fieldKey].slice(end);
      updateCurrentTemplate({
        [fieldKey]: `${before}${token}${after}`,
      });
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(token);
      } catch {
        // Ignore clipboard errors in restricted frames
      }
    }

    setCopiedToken(token);
    setTimeout(() => {
      setCopiedToken((curr) => (curr === token ? null : curr));
    }, 1800);
  };

  const preview = useMemo(() => {
    const resolvedAdminEmail =
      value.adminRecipientEmail?.trim() || footerContact.email || adminEmail || 'hotellepays@gmail.com';
    return renderEmailFromTemplate(
      activeTab,
      SAMPLE_RESERVATION_FOR_PREVIEW,
      value,
      {
        hotelName: 'Hôtel Le Pays',
        adminEmail: resolvedAdminEmail,
        hotelPhone: footerContact.phone || '+221 77 698 63 82',
        hotelAddress: footerContact.address || 'Sendou, Dakar, Sénégal',
      },
      { isTest: false }
    );
  }, [activeTab, value, footerContact, adminEmail]);

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = testRecipient.trim();
    if (!targetEmail || !/\S+@\S+\.\S+/.test(targetEmail)) {
      onNotify('error', 'Veuillez saisir une adresse e-mail valide pour le test.');
      return;
    }

    setSendingTest(true);
    setTestStatus(null);
    try {
      const res = await fetch('/api/admin/email-test/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateType: testTarget,
          recipientEmail: targetEmail,
          templateConfig: value,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        const errMsg = data?.error || "Échec de l'envoi de l'e-mail de test.";
        setTestStatus({ ok: false, message: errMsg });
        onNotify('error', errMsg);
      } else {
        const modeLabel =
          data.result?.mode === 'smtp'
            ? 'SMTP configuré'
            : data.result?.mode === 'resend'
              ? 'API Resend'
              : "Boîte d'envoi locale (app/data/email-outbox.json)";
        const okMsg = `E-mail de test envoyé vers ${data.result?.recipientEmail} via ${modeLabel}.`;
        setTestStatus({
          ok: true,
          mode: modeLabel,
          recipientEmail: data.result?.recipientEmail,
          subject: data.result?.subject,
          messageId: data.result?.messageId,
          message: okMsg,
        });
        onNotify('success', okMsg);
      }
    } catch {
      const errMsg = "Erreur réseau lors de l'envoi de l'e-mail de test.";
      setTestStatus({ ok: false, message: errMsg });
      onNotify('error', errMsg);
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">Modèles d&apos;e-mails &amp; Reçus</h2>
          <p className="text-sm text-slate-400">
            Configurez les reçus HTML envoyés automatiquement lors d&apos;une réservation et testez
            le rendu en direct.
          </p>
        </div>

        <div className="inline-flex rounded-xl bg-slate-900 border border-slate-800 p-1">
          <button
            type="button"
            onClick={() => handleTabSwitch('guest')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold border-0 cursor-pointer transition-colors ${
              activeTab === 'guest'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-transparent text-slate-300 hover:text-white'
            }`}
          >
            Reçu Client
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('admin')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold border-0 cursor-pointer transition-colors ${
              activeTab === 'admin'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-transparent text-slate-300 hover:text-white'
            }`}
          >
            Notification Admin
          </button>
        </div>
      </div>

      {/* Global Email Branding & Recipient */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Mail className="w-4 h-4 text-amber-400" />
          <span>Paramètres généraux des e-mails</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Couleur d&apos;accent des reçus</label>
            <div className="flex items-center gap-2.5">
              <input
                type="color"
                value={/^#[0-9a-fA-F]{6}$/.test(value.accentColor) ? value.accentColor : '#b4833e'}
                onChange={(e) => onChange({ ...value, accentColor: e.target.value })}
                className="h-9 w-12 rounded-lg bg-slate-950 border border-slate-700/80 p-1 cursor-pointer"
                aria-label="Choisir la couleur d'accent"
              />
              <input
                type="text"
                value={value.accentColor}
                onChange={(e) => onChange({ ...value, accentColor: e.target.value })}
                placeholder="#b4833e"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>
              E-mail de réception administrateur (optionnel)
            </label>
            <input
              type="email"
              value={value.adminRecipientEmail}
              onChange={(e) => onChange({ ...value, adminRecipientEmail: e.target.value })}
              placeholder={footerContact.email || adminEmail || 'hotellepays@gmail.com'}
              className={inputClass}
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Si vide, utilise l&apos;adresse configurée dans le pied de page ({footerContact.email || adminEmail}).
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Template Configuration & Test Sender */}
        <div className="xl:col-span-6 space-y-6">
          <div className={cardClass}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-white m-0">
                {activeTab === 'guest'
                  ? 'Modèle — Reçu de confirmation client'
                  : 'Modèle — Notification administrateur'}
              </h3>
              <button
                type="button"
                onClick={handleResetActiveTemplate}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 text-xs font-medium border-0 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Réinitialiser ce modèle</span>
              </button>
            </div>

            <div>
              <label className={labelClass}>Objet de l&apos;e-mail</label>
              <input
                type="text"
                value={currentTemplate.subject}
                onChange={(e) => updateCurrentTemplate({ subject: e.target.value })}
                className={inputClass}
              />
            </div>

            {!currentTemplate.useCustomHtml && (
              <>
                <div>
                  <label className={labelClass}>Titre principal (en-tête)</label>
                  <input
                    type="text"
                    value={currentTemplate.heading}
                    onChange={(e) => updateCurrentTemplate({ heading: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Texte d&apos;introduction</label>
                  <textarea
                    ref={introTextRef}
                    rows={3}
                    value={currentTemplate.introText}
                    onChange={(e) => updateCurrentTemplate({ introText: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Libellé du bouton d&apos;action</label>
                    <input
                      type="text"
                      value={currentTemplate.ctaLabel}
                      onChange={(e) => updateCurrentTemplate({ ctaLabel: e.target.value })}
                      placeholder="Voir Mes Réservations"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Note / Conditions en pied d&apos;e-mail</label>
                    <input
                      type="text"
                      value={currentTemplate.footerNote}
                      onChange={(e) => updateCurrentTemplate({ footerNote: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Custom HTML Toggle */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <label className="flex items-center justify-between gap-3 cursor-pointer">
                <span className="flex items-center gap-2 text-xs font-medium text-slate-200">
                  <Code2 className="w-4 h-4 text-amber-400" />
                  <span>Utiliser un modèle HTML personnalisé complet</span>
                </span>
                <input
                  type="checkbox"
                  checked={currentTemplate.useCustomHtml}
                  onChange={(e) => updateCurrentTemplate({ useCustomHtml: e.target.checked })}
                  className="h-4 w-4 accent-amber-500 cursor-pointer"
                />
              </label>

              {currentTemplate.useCustomHtml && (
                <div>
                  <label className={labelClass}>Code HTML du modèle</label>
                  <textarea
                    ref={customHtmlRef}
                    rows={14}
                    value={currentTemplate.customHtml}
                    onChange={(e) => updateCurrentTemplate({ customHtml: e.target.value })}
                    className={`${inputClass} font-mono text-xs leading-relaxed`}
                    spellCheck={false}
                  />
                </div>
              )}

              {/* Variable Tokens Helper */}
              <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Variables dynamiques disponibles (cliquer pour insérer / copier)
                  </span>
                  {copiedToken && (
                    <span className="text-[11px] text-amber-400 font-medium">
                      Inséré : {copiedToken}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {EMAIL_TEMPLATE_PLACEHOLDERS.map((item) => (
                    <button
                      key={item.token}
                      type="button"
                      title={item.description}
                      onClick={() => handleInsertToken(item.token)}
                      className="inline-flex items-center gap-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700/80 px-2 py-1 text-[11px] font-mono text-amber-300 cursor-pointer transition-colors"
                    >
                      <Copy className="w-2.5 h-2.5 opacity-70" />
                      <span>{item.token}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Send Test Email Card */}
          <form onSubmit={handleSendTestEmail} className={cardClass}>
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Send className="w-4 h-4 text-amber-400" />
              <span>Envoyer un e-mail de test</span>
            </div>
            <p className="text-xs text-slate-400 m-0">
              Envoie immédiatement un aperçu réel basé sur une réservation fictive en utilisant votre
              configuration actuelle (même avant enregistrement).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-4">
                <label className={labelClass}>Modèle à tester</label>
                <select
                  value={testTarget}
                  onChange={(e) => setTestTarget(e.target.value === 'admin' ? 'admin' : 'guest')}
                  className={inputClass}
                >
                  <option value="guest">Reçu Client</option>
                  <option value="admin">Notification Admin</option>
                </select>
              </div>
              <div className="sm:col-span-5">
                <label className={labelClass}>Adresse e-mail destinataire</label>
                <input
                  type="email"
                  required
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  placeholder="votre@email.com"
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-3">
                <button
                  type="submit"
                  disabled={sendingTest}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-semibold px-3 py-2 text-xs border-0 cursor-pointer transition-colors"
                >
                  {sendingTest ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{sendingTest ? 'Envoi...' : 'Tester'}</span>
                </button>
              </div>
            </div>

            {testStatus && (
              <div
                className={`rounded-lg border px-3.5 py-2.5 text-xs flex items-start gap-2.5 ${
                  testStatus.ok
                    ? 'bg-emerald-950/60 border-emerald-700/70 text-emerald-200'
                    : 'bg-red-950/60 border-red-700/70 text-red-200'
                }`}
              >
                {testStatus.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <div className="font-semibold">{testStatus.message}</div>
                  {testStatus.subject && (
                    <div className="text-[11px] opacity-85">Objet : {testStatus.subject}</div>
                  )}
                  {testStatus.messageId && (
                    <div className="text-[11px] opacity-75 font-mono">
                      ID : {testStatus.messageId}
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Live HTML Preview */}
        <div className="xl:col-span-6">
          <div className={cardClass}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Eye className="w-4 h-4 text-amber-400" />
                <span>Aperçu en direct</span>
              </div>

              <div className="inline-flex rounded-lg bg-slate-950 border border-slate-800 p-0.5">
                <button
                  type="button"
                  onClick={() => setPreviewMode('desktop')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border-0 cursor-pointer transition-colors ${
                    previewMode === 'desktop'
                      ? 'bg-slate-800 text-white'
                      : 'bg-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Bureau</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('mobile')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border-0 cursor-pointer transition-colors ${
                    previewMode === 'mobile'
                      ? 'bg-slate-800 text-white'
                      : 'bg-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            <div className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs">
              <span className="text-slate-400">Objet : </span>
              <span className="text-slate-100 font-medium">{preview.subject}</span>
            </div>

            <div className="rounded-xl bg-slate-200/95 p-3 flex justify-center overflow-x-auto">
              <iframe
                title="Aperçu HTML de l'e-mail de confirmation"
                srcDoc={preview.html}
                sandbox="allow-same-origin"
                className="bg-white rounded-lg border border-slate-300 shadow-sm transition-all duration-200"
                style={{
                  width: previewMode === 'mobile' ? '375px' : '100%',
                  maxWidth: '680px',
                  height: '720px',
                }}
              />
            </div>

            <p className="text-[11px] text-slate-400 m-0">
              Cliquez sur <strong className="text-slate-200">Enregistrer</strong> dans la barre
              supérieure pour appliquer ces modèles aux prochaines réservations clients.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
