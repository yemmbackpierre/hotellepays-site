// ...existing code...

import { Room } from '../types/hotelData';
import { getPb, isPBEnabled, getFileUrl } from '../lib/pocketbase';
import { fallback } from './fallback.service';
import * as firestoreService from './firestoreService';
import { mapFirestoreRoom } from './mappers';

const COLLECTION = 'rooms';

const isFirestoreEnabled = () => process.env.FIRESTORE_ENABLED === 'true' || process.env.NEXT_PUBLIC_FIRESTORE_ENABLED === 'true';

export const roomsService = {
  getAllRooms: async (): Promise<Room[]> => {
    // 1) Firestore
    if (isFirestoreEnabled()) {
      try {
        const docs = await firestoreService.getAllRooms();
        if (docs && docs.length > 0) {
          // use mapper
          return docs.map((d: any) => mapFirestoreRoom(d));
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('roomsService.getAllRooms firestore error:', err);
        // fall through to next source
      }
    }

    // 2) PocketBase
    if (isPBEnabled()) {
      try {
        const pb = getPb();
        const records = await pb.collection(COLLECTION).getFullList({ sort: '-created' });

        const rooms: Room[] = (records || []).map((r: any) => {
          const images = (r.images || []).map((f: any) => getFileUrl(r, 'images', f));
          return {
            name: r.name || r.title || '',
            slug: r.slug || '',
            title: r.title || r.name || '',
            subtitle: r.subtitle || '',
            type: r.type || '',
            guests: Number(r.guests) || 1,
            size: r.size || '',
            price: r.price ? String(r.price) : r.price || '',
            default_curency: r.default_curency || { code: 'XOF', name: 'CFA Franc', symbol: 'CFA', rateToEUR: 655.957 },
            description: r.description || '',
            basicInfo: r.basicInfo || [],
            details: r.details || [],
            facilities: r.facilities || [],
            images: images,
            image: images[0] || r.image || '',
            link: r.link || ''
          } as Room;
        });

        if (!rooms || rooms.length === 0) {
          return fallback.getRooms();
        }

        return rooms;
      } catch (err) {
        // on error, continue to fallback
        // eslint-disable-next-line no-console
        console.warn('roomsService.getAllRooms pb error:', err);
      }
    }

    // 3) fallback
    return fallback.getRooms();
  },

  getRoomBySlug: async (slug: string): Promise<Room | null> => {
    // 1) Firestore
    if (isFirestoreEnabled()) {
      try {
        const doc = await firestoreService.getRoomBySlug(slug);
        if (doc) {
          return mapFirestoreRoom(doc) as Room;
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('roomsService.getRoomBySlug firestore error:', err);
        // continue
      }
    }

    // 2) PocketBase
    if (isPBEnabled()) {
      try {
        const pb = getPb();
        const records = await pb.collection(COLLECTION).getFullList({ filter: `slug = "${slug}"`, perPage: 1 });
        const r = (records && records[0]) || null;
        if (!r) {
          // fallback
          const rooms = await fallback.getRooms();
          return (rooms || []).find((x: any) => x.slug === slug) || null;
        }

        const images = (r.images || []).map((f: any) => getFileUrl(r, 'images', f));
        const room: Room = {
          name: r.name || r.title || '',
          slug: r.slug || '',
          title: r.title || r.name || '',
          subtitle: r.subtitle || '',
          type: r.type || '',
          guests: Number(r.guests) || 1,
          size: r.size || '',
          price: r.price ? String(r.price) : r.price || '',
          default_curency: r.default_curency || { code: 'XOF', name: 'CFA Franc', symbol: 'CFA', rateToEUR: 655.957 },
          description: r.description || '',
          basicInfo: r.basicInfo || [],
          details: r.details || [],
          facilities: r.facilities || [],
          images: images,
          image: images[0] || r.image || '',
          link: r.link || ''
        };

        return room;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('roomsService.getRoomBySlug pb error:', err);
        const rooms = await fallback.getRooms();
        return (rooms || []).find((x: any) => x.slug === slug) || null;
      }
    }

    // 3) fallback
    const rooms = await fallback.getRooms();
    return (rooms || []).find((r: any) => r.slug === slug) || null;
  }
};

// Petit hack dev-only pour éviter l'avertissement `unused` lors du build local
if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  void roomsService;
}
