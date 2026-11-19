Migration script

Usage:

1) Export required env vars (server-side):

- FIREBASE_SERVICE_ACCOUNT_KEY: JSON stringified service account (example: cat serviceAccount.json | jq -c .)
- FIREBASE_DATABASE_URL: your Firestore DB URL (optional if using default)
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- CLOUDINARY_FOLDER (optional)

2) Run:

  node scripts/migrate-to-firestore.js

Behavior:
- Uploads local images from `public/` to Cloudinary and stores secure URLs in Firestore.
- Creates documents in `rooms` and `posts` collections.

Notes:
- Test on a staging Firebase project before production.
- Script assumes static data is present in `app/types/hotelData.ts` as `defaultPosts` and `defaultRooms`.

