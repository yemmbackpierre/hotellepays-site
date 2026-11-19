// components/ContactSection.tsx

import {ContactData, defaultContactData} from "@/app/types/hotelData";
import ContactForm from "@/app/components/forms/ContactForm";

// Helpers extracted to reduce cognitive complexity inside the component
const normalizeNumber = (val?: any) => (val || '').toString().replace(/\D/g, '');
const looksLikePhone = (val?: any) => !!val?.toString().match(/\+?[0-9\s-]{6,}/);

const buildWhatsappHref = (item: any) => {
    if (item.link) return item.link;
    const number = normalizeNumber(item.number || item.value);
    return number ? `https://wa.me/${number}` : '';
};

const buildEmailHref = (item: any) => item.link || (item.value ? `mailto:${item.value}` : '');
const buildPhoneHref = (item: any) => item.link || (normalizeNumber(item.number || item.value) ? `tel:${normalizeNumber(item.number || item.value)}` : '');

const buildHoursHref = (item: any) => {
    if (item.link?.startsWith('tel:')) return item.link;
    if (item.number && normalizeNumber(item.number)) return `tel:${normalizeNumber(item.number)}`;
    if (looksLikePhone(item.value)) return `tel:${normalizeNumber(item.value)}`;
    return '';
};

const buildLocationHref = (item: any) => {
    if (item.link) return item.link;
    // If coordinates are stored in item.number as 'lat,lng' (possibly with spaces), use Google Maps Directions
    if (item.number?.includes(',')) {
        const coords = item.number.toString().replace(/\s+/g, ''); // remove spaces
        return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(coords)}`;
    }
    // Fallback: use search query
    if (item.value) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.value)}`;
    return '';
};

const ContactSection = ({ data = defaultContactData }: { data?: ContactData }) => {
    const makeLink = (item: any) => {
        const builders: Record<string, (i: any) => string> = {
            whatsapp: buildWhatsappHref,
            email: buildEmailHref,
            phone: buildPhoneHref,
            hours: buildHoursHref,
            location: buildLocationHref,
        };

        const href = (builders[item.type] ? builders[item.type](item) : (item.link || '')) || '';
        if (!href) return null;
        return { href, target: '_blank', rel: 'noopener noreferrer' };
    };

    return (
        <>
            {/* Contact Form */}
            <section className="contact-details">
                <div className="container pt-110 pb-70">
                    <div className="row">
                        {/* Form */}
                        <div className="col-xl-7 col-lg-6">
                            <ContactForm/>

                        </div>

                        {/* Contact Infos */}
                        <div className="col-xl-5 col-lg-6">
                            <div className="contact-details__right">
                                <div className="sec-title">
                                    <span className="sub-title before-none">{data.sectionSubtitle}</span>
                                    <h2>{data.sectionTitle}</h2>
                                    <div className="text">{data.description}</div>
                                </div>
                                <ul className="list-unstyled contact-details__info">
                                    {data.contactItems.map((item, i) => {
                                        const linkProps = makeLink(item);
                                        const key = `${item.type ?? 'item'}-${i}-${(item.value || '').toString().slice(0,10)}`;
                                        return (
                                            <li key={key}>

                                                {linkProps ? (
                                                    <a href={linkProps.href} target={linkProps.target} rel={linkProps.rel} className="contact-link">
                                                        <div className="icon">
                                                            <span className={`fal ${item.icon}`}></span>
                                                        </div>
                                                    </a>
                                                ) : (
                                                    <div className="icon">
                                                        <span className={`fal ${item.icon}`}></span>
                                                    </div>
                                                )}

                                                <div className="text">
                                                    {/* Rendre le titre cliquable si linkProps existe */}
                                                    <h6 className="mb-1">
                                                        {linkProps ? (
                                                            <a href={linkProps.href} target={linkProps.target} rel={linkProps.rel} className="contact-title-link">{item.title}</a>
                                                        ) : (
                                                            item.title
                                                        )}
                                                    </h6>

                                                    {/* Valeur cliquable également (numéro/email/adresse) */}
                                                    {linkProps ? (
                                                        <a href={linkProps.href} target={linkProps.target} rel={linkProps.rel} className="d-block contact-value">{item.value}</a>
                                                    ) : (
                                                        <span>{item.value}</span>
                                                    )}
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="map-section">
                <iframe
                    title="Hôtel Le Pays - Localisation"
                    className="map w-100"
                    src={data.mapSrc}
                    width="100%"
                    height="600"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </section>
        </>
    );
};

export default ContactSection;
