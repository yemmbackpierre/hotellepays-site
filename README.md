# 🏨 Hôtel LePays – Site Web Officiel

Site web vitrine et de réservation en ligne de **l’Hôtel LePays**, situé au **Sénégal**.  
Le projet est développé avec **Next.js (App Router)** et permet aux clients de consulter l’hôtel, réserver une chambre et effectuer un paiement en ligne.  
Les réservations sont automatiquement enregistrées dans **Dolibarr** (ERP de l’hôtel).

---

## 🚀 Objectifs du projet

- Présenter l’Hôtel LePays (A propos, chambres, suites, prix, services, galerie, localisation, contact)
- Permettre la **réservation en ligne**
- Offrir le **paiement en ligne sécurisé** (stripe et par paiement mobil)
- Synchroniser les réservations avec **Dolibarr**
- faire des demande de reservation ou contacter le psersonel **par watsapp**
- Site rapide, moderne et optimisé SEO
- faire un petit backend html js firebase pour la gestion de contenu dynamique des page du site (il faut que se soit une parge html c important pour sa portabilite)

---

## 🛠️ Technologies utilisées

- **Next.js** (App Router)
- **React**
- **TypeScript**
- **Tailwind CSS**
- **ESLint**
- **API REST Dolibarr**
- **Solution de paiement en ligne** (à définir : PayDunya, Stripe, PayPal, etc.)

---

## 📁 Structure du projet

---

## 📄 Pages principales

- **Accueil**
- **À propos**
- **Chambres & Suites**
- **Services**
- **Galerie**
- **Réservation en ligne**
- **Contact**
- **Politique de confidentialité / CGV**

---

## 🧾 Fonctionnalité Réservation

1. Le client sélectionne :
    - Dates (arrivée / départ)
    - Type de chambre
    - Nombre de personnes
2. Le client renseigne ses informations personnelles
3. Le système :
    - Vérifie la disponibilité
    - Crée une réservation
    - Enregistre la réservation dans **Dolibarr**
4. Le client procède au paiement en ligne
5. Confirmation envoyée par email

---

## 🔗 Intégration Dolibarr

Les réservations sont enregistrées dans Dolibarr via son **API REST** :

- Création de :
    - Tiers (client)
    - Proposition commerciale / réservation
- Synchronisation des données :
    - Nom du client
    - Dates de séjour
    - Type de chambre
    - Montant payé

Les paramètres de connexion à Dolibarr sont stockés dans les variables d’environnement.

---

## 🔐 Variables d’environnement eventuel

Créer un fichier `.env.local` :

```env
DOLIBARR_API_URL=https://dolibarr.mondomaine.com/api/index.php
DOLIBARR_API_KEY=xxxxxxxxxxxxxxxx

PAYMENT_API_KEY=xxxxxxxxxxxxxxxx
PAYDUNIA_API_KEY=xxxxxxxxxxxxxxxx
PAYPAL_API_KEY=xxxxxxxxxxxxxxxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000

ARBORESSANCE ACTUELLE: 
lepayshotel-site/
├── app/
│ ├── home.tsx # Page d’accueil
│ ├── about.tsx # Page apropos
│ ├── chambres/ # Pages des chambres
│ ├── suites/ # Pages des suites
│ ├── piece_detail/ # details d'une chambre ou suite
│ ├── pricing/ # grille de prix de l’hôtel
│ ├── services/ # Services de l’hôtel
│ ├── galerie/ # Galerie photos
│ ├── reservation/ # Réservation en ligne
│ ├── contact/ # Page contact
│ └── api/
│ ├── reservation/ # API réservation
│ ├── paiement/ # API paiement
│ └── dolibarr/ # Intégration Dolibarr
├── components/ # Composants réutilisables
├── public/ #   assets
├──  └──assets/ # Images, css,js etc
├──  └──file.svg
├──  └──globe.svg
├──  └──next.svg
├──  └──vercel.svg
├──  └──window.svg
├──next.config.ts
├──next-env.d.ts
├──package.json
├──package-lock.json
├──postcss.config.mjs
├──tsconfig.json
└── README.md

 

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.





 

 

