import PocketBase from 'pocketbase';

// ...existing code...

const PB_URL = process.env.PB_URL || process.env.NEXT_PUBLIC_PB_URL || 'http://127.0.0.1:8090';

// singleton client for public (non-admin) usage
const pb = new PocketBase(PB_URL);

export const isPBEnabled = (): boolean => {
  return process.env.PB_ENABLED === 'true' || process.env.NEXT_PUBLIC_PB_ENABLED === 'true';
};

export const getPb = (): PocketBase => pb;

export const getFileUrl = (record: any, fieldName: string, fileName?: any): string => {
  try {
    // pocketbase sdk type definitions differ; cast to any to call getFileUrl safely
    return (pb as any).getFileUrl(record, fieldName, fileName);
  } catch (err) {
    // graceful fallback
    // eslint-disable-next-line no-console
    console.warn('getFileUrl error:', err);
    return '';
  }
};

// Helper to create a server-side PocketBase client optionally authenticated as admin
export const getServerPocketBase = async (adminEmail?: string, adminPassword?: string): Promise<PocketBase> => {
  const serverPb = new PocketBase(PB_URL);
  const email = adminEmail || process.env.PB_ADMIN_EMAIL;
  const pass = adminPassword || process.env.PB_ADMIN_PASSWORD;

  if (email && pass) {
    try {
      // attempt admin login (if credentials provided in env)
      // admin login is only used server-side for privileged operations
      // @ts-ignore - admin auth method exists on the SDK
      await (serverPb as any).admins.authWithPassword(email, pass);
    } catch (err) {
      // don't throw here: return the client (calls may still work for public reads)
      // log for debugging in server logs
      // eslint-disable-next-line no-console
      console.warn('PocketBase admin login failed:', err);
    }
  }

  return serverPb;
};

// Référence dev-only pour marquer l'utilisation de la fonction server-side et éviter le
// warning TS `unused` lors du build local.
if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  void getServerPocketBase;
}

// ...existing code...
