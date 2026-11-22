import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  ShieldAlert,
  ShieldCheck,
  XCircle,
  CalendarCheck,
  Building2,
} from 'lucide-react';
import Breadcrumb from '@/app/layouts/Breadcrumb';
import { getSiteContent } from '@/app/lib/siteContent';
import { getReservationByNumber } from '@/app/lib/reservationsStore.server';
import { verifyReservationVerificationSignature } from '@/app/lib/reservationVerification.server';
import { formatEmailDateFr, formatEmailXof } from '@/app/lib/emailTemplates';
import {
  getPaymentStatusLabelFr,
  getReservationStatusLabelFr,
} from '@/app/lib/whatsapp.server';

export const dynamic = 'force-dynamic';

export default async function VerifyReservationPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; sig?: string }>;
}) {
  const params = await searchParams;
  const ref = typeof params?.ref === 'string' ? params.ref.trim() : '';
  const sig = typeof params?.sig === 'string' ? params.sig.trim() : '';

  const [siteContent, reservation] = await Promise.all([
    getSiteContent(),
    ref ? getReservationByNumber(ref) : Promise.resolve(null),
  ]);

  const isSignatureValid = Boolean(
    reservation &&
      sig &&
      verifyReservationVerificationSignature(
        reservation.reservationNumber,
        reservation.createdAt,
        sig
      )
  );

  const verifiedRecord = isSignatureValid ? reservation : null;

  return (
    <>
      <Breadcrumb
        title="Vérification de Réservation"
        paths={[
          { name: 'Accueil', link: '/' },
          { name: 'Vérification' },
        ]}
        backgroundImage="/assets/images/resource/page-title-bg.png"
      />
      <section className="py-5" style={{ backgroundColor: '#faf8f4', minHeight: '65vh' }}>
        <div className="container">
          <div
            className="bg-white border border-[#e5e0d5] rounded-lg p-4 p-md-5 mx-auto shadow-sm"
            style={{ maxWidth: 720 }}
          >
            <div className="pb-3 mb-4 border-bottom border-[#efeae0]">
              <div
                className="text-uppercase small fw-semibold d-flex align-items-center gap-2"
                style={{ color: '#9a6b2f', letterSpacing: '0.08em' }}
              >
                <Building2 className="w-4 h-4" />
                <span>Hôtel Le Pays · Portail officiel de vérification</span>
              </div>
              <h2 className="h3 mt-2 mb-1 text-dark">
                Vérification d&apos;authenticité de réservation
              </h2>
              <p className="text-muted small mb-0">
                Contrôle en temps réel des attestations et fiches officielles de réservation
                émises par l&apos;Hôtel Le Pays (Sendou, Sénégal).
              </p>
            </div>

            {!verifiedRecord ? (
              <div className="alert alert-danger d-flex align-items-start gap-3" role="alert">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="h6 fw-bold mb-1">
                    Document non vérifiable ou signature invalide
                  </h3>
                  <p className="small mb-2">
                    Impossible de vérifier cette référence de réservation. Veuillez scanner le
                    QR code officiel figurant sur la confirmation PDF délivrée par l&apos;hôtel
                    ou contacter notre administration.
                  </p>
                  <Link href="/" className="btn btn-sm btn-outline-dark">
                    Retour à l&apos;accueil
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <div
                  className={`p-3 rounded border d-flex align-items-start gap-3 mb-4 ${
                    verifiedRecord.status === 'confirmed'
                      ? 'bg-success-subtle border-success-subtle text-success-emphasis'
                      : verifiedRecord.status === 'cancelled'
                        ? 'bg-danger-subtle border-danger-subtle text-danger-emphasis'
                        : verifiedRecord.status === 'completed'
                          ? 'bg-secondary-subtle border-secondary-subtle text-secondary-emphasis'
                          : 'bg-warning-subtle border-warning-subtle text-warning-emphasis'
                  }`}
                >
                  {verifiedRecord.status === 'confirmed' && (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-1" />
                  )}
                  {verifiedRecord.status === 'cancelled' && (
                    <XCircle className="w-5 h-5 flex-shrink-0 mt-1" />
                  )}
                  {verifiedRecord.status === 'completed' && (
                    <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-1" />
                  )}
                  {verifiedRecord.status === 'pending' && (
                    <Clock className="w-5 h-5 flex-shrink-0 mt-1" />
                  )}
                  <div>
                    <div className="fw-bold">
                      Authenticité vérifiée · Statut actuel :{' '}
                      {getReservationStatusLabelFr(verifiedRecord.status)}
                    </div>
                    <div className="small mt-1">
                      Statut de paiement enregistré :{' '}
                      <strong>{getPaymentStatusLabelFr(verifiedRecord.paymentStatus)}</strong>
                      {verifiedRecord.status === 'pending' &&
                        ' (Cette demande n’a pas encore été validée définitivement par l’administration.)'}
                      {verifiedRecord.status === 'cancelled' &&
                        verifiedRecord.cancellationReason &&
                        ` — Motif : ${verifiedRecord.cancellationReason}`}
                    </div>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-bordered align-middle mb-0">
                    <tbody>
                      <tr>
                        <th className="bg-light text-secondary small" style={{ width: '36%' }}>
                          Référence officielle
                        </th>
                        <td className="fw-bold text-dark">
                          {verifiedRecord.reservationNumber}
                        </td>
                      </tr>
                      <tr>
                        <th className="bg-light text-secondary small">Établissement</th>
                        <td>
                          Hôtel Le Pays — {siteContent.footer?.contact?.address || 'Sendou, Sénégal'}
                        </td>
                      </tr>
                      <tr>
                        <th className="bg-light text-secondary small">Titulaire du séjour</th>
                        <td>{verifiedRecord.customer?.name || 'Non précisé'}</td>
                      </tr>
                      <tr>
                        <th className="bg-light text-secondary small">Dates du séjour</th>
                        <td>
                          <span className="d-inline-flex align-items-center gap-1">
                            <CalendarCheck className="w-4 h-4 text-muted" />
                            Arrivée : {formatEmailDateFr(verifiedRecord.arrival)}
                          </span>
                          <br />
                          Départ : {formatEmailDateFr(verifiedRecord.departure)}
                        </td>
                      </tr>
                      <tr>
                        <th className="bg-light text-secondary small">Durée &amp; Hébergement</th>
                        <td>
                          {verifiedRecord.nights} nuit(s) · {verifiedRecord.numRooms} chambre(s)
                          {verifiedRecord.offer ? ` · Offre ${verifiedRecord.offer.title}` : ''}
                        </td>
                      </tr>
                      <tr>
                        <th className="bg-light text-secondary small">Montant enregistré</th>
                        <td className="fw-bold" style={{ color: '#9a6b2f' }}>
                          {formatEmailXof(verifiedRecord.total)}
                        </td>
                      </tr>
                      <tr>
                        <th className="bg-light text-secondary small">Date d&apos;enregistrement</th>
                        <td>{formatEmailDateFr(verifiedRecord.createdAt)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 pt-3 border-top">
                  <span className="small text-muted">
                    Contact hôtel : {siteContent.footer?.contact?.phone || '+221 77 698 63 82'}
                  </span>
                  <Link href="/profile/" className="btn btn-sm btn-dark">
                    Accéder à l&apos;Espace Client
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
