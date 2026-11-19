// app/room-details/page.tsx
import type { Metadata } from 'next';
import Link from "next/link";
import { defaultRooms, defaultPresentationRoms, defaultSuites } from "@/app/types/hotelData";
import { suggestKeywords } from '@/app/lib/seo';

const title = 'Chambres — Hôtel Le Pays, Sendou (Dakar)';
const description = 'Liste des chambres et suites disponibles à l\'Hôtel Le Pays à Sendou. Trouvez la chambre idéale proche de Rufisque et Bargny.';

export const metadata: Metadata = {
    title,
    description,
    keywords: suggestKeywords({ title, description })
}

export default function Page() {
  const rooms = [...defaultRooms, ...defaultPresentationRoms, ...defaultSuites];


  return (
    <div style={{ padding: 20 }}>
      <h1>Chambres et Suites à Sendou</h1>
      <ul>
        {rooms.map((r) => (
          <li key={r.slug}>
            <Link href={`/room-details/${r.slug}`}>{r.title || r.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
