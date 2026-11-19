import { BlogPost } from '../types/hotelData';
import { fallback } from './fallback.service';
import * as firestoreService from './firestoreService';
import { getPb, isPBEnabled, getFileUrl } from '../lib/pocketbase';
import { mapFirestorePost } from './mappers';

const isFirestoreEnabled = () => process.env.FIRESTORE_ENABLED === 'true' || process.env.NEXT_PUBLIC_FIRESTORE_ENABLED === 'true';

export const postsService = {
  getAllPosts: async (): Promise<BlogPost[]> => {
    // 1) Firestore
    if (isFirestoreEnabled()) {
      try {
        const docs = await firestoreService.getAllPosts();
        if (docs && docs.length > 0) {
          return docs.map((d: any) => mapFirestorePost(d));
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('postsService.getAllPosts firestore error:', err);
      }
    }

    // 2) PocketBase
    if (isPBEnabled()) {
      try {
        const pb = getPb();
        const records = await pb.collection('posts').getFullList({ sort: '-created' });
        const posts: BlogPost[] = (records || []).map((r: any) => ({
          title: r.title || '',
          slug: r.slug || '',
          date: r.date || r.created || '',
          thumb: (r.thumb && getFileUrl(r, 'thumb', r.thumb)) || '',
          link: r.link || `/blog-details/${r.slug}`,
          excerpt: r.excerpt || '',
          html_content: r.html_content || r.content || '',
          images: (r.images || []).map((f: any) => getFileUrl(r, 'images', f)),
          comments_number: r.comments_number || 0,
          comments: r.comments || [],
          tags: r.tags || []
        } as BlogPost));

        if (!posts || posts.length === 0) return fallback.getPosts();
        return posts;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('postsService.getAllPosts pb error:', err);
      }
    }

    // 3) fallback
    return fallback.getPosts();
  },

  getPostBySlug: async (slug: string): Promise<BlogPost | null> => {
    if (isFirestoreEnabled()) {
      try {
        const doc = await firestoreService.getPostBySlug(slug);
        if (doc) {
          return mapFirestorePost(doc) as BlogPost;
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('postsService.getPostBySlug firestore error:', err);
      }
    }

    if (isPBEnabled()) {
      try {
        const pb = getPb();
        const records = await pb.collection('posts').getFullList({ filter: `slug = "${slug}"`, perPage: 1 });
        const r = (records && records[0]) || null;
        if (!r) return (await fallback.getPosts()).find((p: any) => p.slug === slug) || null;
        return {
          title: r.title || '',
          slug: r.slug || '',
          date: r.date || r.created || '',
          thumb: (r.thumb && getFileUrl(r, 'thumb', r.thumb)) || '',
          link: r.link || `/blog-details/${r.slug}`,
          excerpt: r.excerpt || '',
          html_content: r.html_content || r.content || '',
          images: (r.images || []).map((f: any) => getFileUrl(r, 'images', f)),
          comments_number: r.comments_number || 0,
          comments: r.comments || [],
          tags: r.tags || []
        } as any;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('postsService.getPostBySlug pb error:', err);
      }
    }

    const posts = await fallback.getPosts();
    return posts.find((p: any) => p.slug === slug) || null;
  }
};

// Petit hack dev-only pour éviter l'avertissement `unused` lors du build local
if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  void postsService;
}
