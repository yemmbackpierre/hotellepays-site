// File: lib/firestore.server.ts
/* eslint-disable @typescript-eslint/no-var-requires */
const admin: any = require('firebase-admin');

let adminDbInstance: any = null;

if (!admin.apps.length) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccount) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert(JSON.parse(serviceAccount)),
                databaseURL: process.env.FIREBASE_DATABASE_URL,
            });
            adminDbInstance = admin.firestore();
        } catch (err) {
            console.warn('[AI Studio] Firebase Admin initialization failed — using fallback data', err);
        }
    } else {
        console.warn('[AI Studio] FIREBASE_SERVICE_ACCOUNT_KEY not defined — Firestore Admin disabled');
    }
} else {
    adminDbInstance = admin.firestore();
}

export const adminDb: any = adminDbInstance;
