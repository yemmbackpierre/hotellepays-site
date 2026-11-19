// File: lib/firestore.server.ts
/* eslint-disable @typescript-eslint/no-var-requires */
const admin: any = require('firebase-admin');

if (!admin.apps.length) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccount) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY not defined');
    }
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccount)),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
}

export const adminDb: any = admin.firestore();
