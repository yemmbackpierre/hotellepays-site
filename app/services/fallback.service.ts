// ...existing code...

import { defaultPosts } from '../types/hotelData';
// Import other default data where present (rooms, testimonials, site info)
// Some data may be in separate files — adjust as needed

export const fallback = {
  getPosts: async () => {
    return defaultPosts;
  },
  // placeholder for rooms; components will import rooms via roomsService which calls fallback when needed
  getRooms: async () => {
    // attempt to import rooms from types file if available
    try {
      // dynamic import to avoid circular issues
      const types = await import('../types/hotelData');
      // Try common exported names
      const rooms = (types as any).defaultRooms || (types as any).roomsData || (types as any).rooms || [];
      return rooms;
    } catch (err) {
      return [];
    }
  }
};

// ...existing code...

