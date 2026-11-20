import { adminDb } from '@/app/lib/firestore.server';

export type Room = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  images?: string[];
  [k: string]: any;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  seo?: { title?: string; description?: string };
  coverImage?: string;
  [k: string]: any;
};

export async function getAllRooms(): Promise<Room[]> {
  if (!adminDb) return [];
  const snap = await adminDb.collection('rooms').get();
  return snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) }));
}

export async function getRoomBySlug(slug: string): Promise<Room | null> {
  if (!adminDb) return null;
  const snap = await adminDb.collection('rooms').where('slug', '==', slug).limit(1).get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...(d.data() as any) };
}

export async function getAllPosts(): Promise<BlogPost[]> {
  if (!adminDb) return [];
  const snap = await adminDb.collection('posts').orderBy('publishedAt', 'desc').get();
  return snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) }));
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!adminDb) return null;
  const snap = await adminDb.collection('posts').where('slug', '==', slug).limit(1).get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...(d.data() as any) };
}

