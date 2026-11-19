import { Room, BlogPost, BookingInfos, Comment } from '../types/hotelData';
import { getFileUrl } from '../lib/pocketbase';

const safeString = (v: any, fallback = ''): string => (v === null || v === undefined) ? fallback : String(v);
const safeNumber = (v: any, fallback = 0): number => {
  const n = Number(v);
  return Number.isNaN(n) ? fallback : n;
};

export const mapRoom = (r: any): Room => {
  let images: string[] = [];

  try {
    if (Array.isArray(r.images) && r.images.length > 0) {
      images = r.images.map((fileRef: any) => getFileUrl(r, 'images', fileRef));
    } else if (r.image) {
      // single image field
      images = [safeString(getFileUrl(r, 'image', r.image))];
    }
  } catch (err) {
    // Log and continue with empty images array
    // eslint-disable-next-line no-console
    console.warn('mapRoom image handling error', err);
    images = [];
  }

  return {
    name: safeString(r.name || r.title),
    slug: safeString(r.slug),
    title: safeString(r.title || r.name),
    subtitle: safeString(r.subtitle),
    type: safeString(r.type),
    guests: safeNumber(r.guests, 1),
    size: safeString(r.size),
    price: safeString(r.price || ''),
    default_curency: r.default_curency || { code: 'XOF', name: 'CFA Franc', symbol: 'CFA', rateToEUR: 655.957 },
    description: safeString(r.description || r.excerpt || ''),
    basicInfo: Array.isArray(r.basicInfo) ? r.basicInfo : [],
    details: Array.isArray(r.details) ? r.details : [],
    facilities: Array.isArray(r.facilities) ? r.facilities : [],
    images: images,
    image: images[0] || safeString(r.image || ''),
    link: safeString(r.link || ''),
    options: Array.isArray(r.options) ? r.options : undefined
  };
};

export const mapBlogPost = (r: any): BlogPost => {
  let images: string[] = [];
  try {
    if (Array.isArray(r.images) && r.images.length > 0) {
      images = r.images.map((f: any) => getFileUrl(r, 'images', f));
    } else if (r.thumb) {
      images = [safeString(getFileUrl(r, 'thumb', r.thumb))];
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('mapBlogPost image handling error', err);
    images = [];
  }

  const comments: Comment[] = Array.isArray(r.comments) ? r.comments.map((c: any) => ({
    id: safeString(c.id || c._id || ''),
    author: safeString(c.author || c.name || 'Anonyme'),
    date: safeString(c.date || c.created || ''),
    content: safeString(c.content || c.body || '')
  })) : [];

  return {
    title: safeString(r.title),
    slug: safeString(r.slug),
    date: safeString(r.date || r.created),
    thumb: safeString(r.thumb || (images[0] || '')),
    link: safeString(r.link || `/blog-details/${safeString(r.slug)}`),
    excerpt: safeString(r.excerpt || ''),
    html_content: safeString(r.html_content || r.content || ''),
    images: images,
    comments: comments,
    tags: Array.isArray(r.tags) ? r.tags : [],
    comments_number: safeNumber(r.comments_number || (comments ? comments.length : 0), 0)
  };
};

export const mapBookingInfos = (r: any): BookingInfos => {
  const customer = r.customer || r.client || {};
  const cust = {
    name: safeString(customer.name || customer.fullName || ''),
    email: safeString(customer.email || ''),
    phone: safeString(customer.phone || customer.mobile || ''),
    whatsapp: Boolean(customer.whatsapp || false)
  } as any;

  const arrival = r.checkIn ? new Date(r.checkIn) : (r.arrival ? new Date(r.arrival) : null);
  const departure = r.checkOut ? new Date(r.checkOut) : (r.departure ? new Date(r.departure) : null);
  const extras = Array.isArray(r.extras) ? r.extras : (r.extras ? [r.extras] : []);

  return {
    arrival,
    departure,
    numRooms: safeNumber(r.numRooms || r.num_rooms || 1, 1),
    rooms: r.rooms || r.roomDetails || {},
    extras,
    customer: cust as any
  };
};

// --- New: Firestore mappers (strict mapping from Firestore doc to existing types)
export const mapFirestoreRoom = (doc: any): Room => {
  const data = doc && doc.data ? (doc.data() as any) : doc || {};
  const images = Array.isArray(data.images) ? data.images.map((i: any) => safeString(i)) : [];
  return {
    name: safeString(data.title || data.name),
    slug: safeString(data.slug),
    title: safeString(data.title || data.name),
    subtitle: safeString(data.subtitle || ''),
    type: safeString(data.type || ''),
    guests: safeNumber(data.guests || 1, 1),
    size: safeString(data.size || ''),
    price: safeString(data.price || ''),
    default_curency: data.default_curency || { code: 'XOF', name: 'CFA Franc', symbol: 'CFA', rateToEUR: 655.957 },
    description: safeString(data.description || data.excerpt || ''),
    basicInfo: Array.isArray(data.basicInfo) ? data.basicInfo : [],
    details: Array.isArray(data.details) ? data.details : [],
    facilities: Array.isArray(data.facilities) ? data.facilities : [],
    images: images,
    image: images[0] || safeString(data.image || ''),
    link: safeString(data.link || ''),
    options: Array.isArray(data.options) ? data.options : undefined
  };
};

export const mapFirestorePost = (doc: any): BlogPost => {
  const data = doc && doc.data ? (doc.data() as any) : doc || {};
  const images = Array.isArray(data.images) ? data.images.map((i: any) => safeString(i)) : [];
  const comments: Comment[] = Array.isArray(data.comments) ? data.comments.map((c: any) => ({
    id: safeString(c.id || c._id || ''),
    author: safeString(c.author || c.name || 'Anonyme'),
    date: safeString(c.date || c.created || ''),
    content: safeString(c.content || c.body || '')
  })) : [];

  return {
    title: safeString(data.title || ''),
    slug: safeString(data.slug || ''),
    date: safeString(data.publishedAt || data.date || ''),
    thumb: safeString(data.coverImage || data.thumb || (images[0] || '')),
    link: safeString(data.link || `/blog-details/${safeString(data.slug)}`),
    excerpt: safeString(data.excerpt || ''),
    html_content: safeString(data.content || data.html_content || ''),
    images: images,
    comments: comments,
    tags: Array.isArray(data.tags) ? data.tags : [],
    comments_number: safeNumber(data.comments_number || (comments ? comments.length : 0), 0)
  };
};

// Petit hack dev-only pour éviter les warnings TypeScript `unused` quand les fonctions
// sont exportées mais non référencées directement dans le code du repo (build statique).
if (process.env.NODE_ENV === 'development') {
  // Référence non-invasive aux fonctions exportées pour marquer leur utilisation.
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  void [mapRoom, mapBlogPost, mapBookingInfos, mapFirestoreRoom, mapFirestorePost];
}
