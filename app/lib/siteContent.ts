import fs from 'fs/promises';
import path from 'path';
import {
  AboutData,
  BlogPost,
  ContactData,
  ExploreItem,
  FAQ,
  Feature,
  HeaderDataItem,
  InstagramItem,
  Pricing,
  Room,
  Service,
  Testimonial,
  defaultAboutData,
  defaultContactData,
  defaultDestinations,
  defaultFeatures,
  defaultImages,
  defaultPosts,
  defaultPresentationRoms,
  defaultRooms,
  defaultSuites,
  defaultTraditionalFoods,
  defaultheaderData,
  footerData as defaultFooterData,
  instagramFeed as defaultInstagramFeed,
  Pricings as defaultPricings,
  FAQData as defaultFAQData,
  serviceData as defaultServiceData,
  sliderData as defaultSliderData,
  testimonials as defaultTestimonials,
} from '@/app/types/hotelData';
import {
  EmailTemplatesConfig,
  getDefaultEmailTemplatesConfig,
  mergeEmailTemplatesConfig,
} from '@/app/lib/emailTemplates';

export type SliderItem = {
  title: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  videoLink?: string;
};

export type FooterDataType = typeof defaultFooterData;

export interface SiteContent {
  header: HeaderDataItem;
  slider: SliderItem[];
  about: AboutData;
  features: Feature[];
  gallery: string[];
  presentationRooms: Room[];
  rooms: Room[];
  suites: Room[];
  foods: ExploreItem[];
  destinations: ExploreItem[];
  testimonials: Testimonial[];
  posts: BlogPost[];
  instagram: InstagramItem[];
  services: Service[];
  pricings: Pricing[];
  faqs: FAQ[];
  contact: ContactData;
  footer: FooterDataType;
  emailTemplates: EmailTemplatesConfig;
}

const CONTENT_FILE_PATH = path.join(process.cwd(), 'app', 'data', 'site-content.json');

export function getDefaultSiteContent(): SiteContent {
  return structuredClone({
    header: defaultheaderData,
    slider: defaultSliderData,
    about: defaultAboutData,
    features: defaultFeatures,
    gallery: defaultImages,
    presentationRooms: defaultPresentationRoms,
    rooms: defaultRooms,
    suites: defaultSuites,
    foods: defaultTraditionalFoods,
    destinations: defaultDestinations,
    testimonials: defaultTestimonials,
    posts: defaultPosts,
    instagram: defaultInstagramFeed,
    services: defaultServiceData,
    pricings: defaultPricings,
    faqs: defaultFAQData,
    contact: defaultContactData,
    footer: defaultFooterData,
    emailTemplates: getDefaultEmailTemplatesConfig(),
  });
}

export async function getSiteContent(): Promise<SiteContent> {
  const defaults = getDefaultSiteContent();
  try {
    const raw = await fs.readFile(CONTENT_FILE_PATH, 'utf-8');
    const saved = JSON.parse(raw) as Partial<SiteContent>;
    return {
      header: saved.header ? { ...defaults.header, ...saved.header } : defaults.header,
      slider: Array.isArray(saved.slider) ? saved.slider : defaults.slider,
      about: saved.about ? { ...defaults.about, ...saved.about } : defaults.about,
      features: Array.isArray(saved.features) ? saved.features : defaults.features,
      gallery: Array.isArray(saved.gallery) ? saved.gallery : defaults.gallery,
      presentationRooms: Array.isArray(saved.presentationRooms)
        ? saved.presentationRooms
        : defaults.presentationRooms,
      rooms: Array.isArray(saved.rooms) ? saved.rooms : defaults.rooms,
      suites: Array.isArray(saved.suites) ? saved.suites : defaults.suites,
      foods: Array.isArray(saved.foods) ? saved.foods : defaults.foods,
      destinations: Array.isArray(saved.destinations) ? saved.destinations : defaults.destinations,
      testimonials: Array.isArray(saved.testimonials) ? saved.testimonials : defaults.testimonials,
      posts: Array.isArray(saved.posts) ? saved.posts : defaults.posts,
      instagram: Array.isArray(saved.instagram) ? saved.instagram : defaults.instagram,
      services: Array.isArray(saved.services) ? saved.services : defaults.services,
      pricings: Array.isArray(saved.pricings) ? saved.pricings : defaults.pricings,
      faqs: Array.isArray(saved.faqs) ? saved.faqs : defaults.faqs,
      contact: saved.contact ? { ...defaults.contact, ...saved.contact } : defaults.contact,
      footer: saved.footer
        ? {
            ...defaults.footer,
            ...saved.footer,
            contact: { ...defaults.footer.contact, ...(saved.footer.contact || {}) },
          }
        : defaults.footer,
      emailTemplates: mergeEmailTemplatesConfig(defaults.emailTemplates, saved.emailTemplates),
    };
  } catch {
    return defaults;
  }
}

export async function saveSiteContent(nextContent: Partial<SiteContent>): Promise<SiteContent> {
  const current = await getSiteContent();
  const merged: SiteContent = {
    ...current,
    ...nextContent,
    header: nextContent.header ? { ...current.header, ...nextContent.header } : current.header,
    about: nextContent.about ? { ...current.about, ...nextContent.about } : current.about,
    contact: nextContent.contact ? { ...current.contact, ...nextContent.contact } : current.contact,
    footer: nextContent.footer
      ? {
          ...current.footer,
          ...nextContent.footer,
          contact: { ...current.footer.contact, ...(nextContent.footer.contact || {}) },
        }
      : current.footer,
    emailTemplates: nextContent.emailTemplates
      ? mergeEmailTemplatesConfig(current.emailTemplates, nextContent.emailTemplates)
      : current.emailTemplates,
  };

  await fs.mkdir(path.dirname(CONTENT_FILE_PATH), { recursive: true });
  await fs.writeFile(CONTENT_FILE_PATH, JSON.stringify(merged, null, 2), 'utf-8');
  return merged;
}

export async function resetSiteContent(): Promise<SiteContent> {
  const defaults = getDefaultSiteContent();
  await fs.mkdir(path.dirname(CONTENT_FILE_PATH), { recursive: true });
  await fs.writeFile(CONTENT_FILE_PATH, JSON.stringify(defaults, null, 2), 'utf-8');
  return defaults;
}
