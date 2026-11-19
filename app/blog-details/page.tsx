import type { Metadata } from 'next';
import Link from "next/link";
import { suggestKeywords } from '@/app/lib/seo';
import {defaultPosts} from "@/app/types/hotelData";

const title = 'Articles de Blog — Hôtel Le Pays, Sendou (Dakar)';
const description = 'Explorez les derniers articles sur le tourisme, les attractions locales, et plus encore autour de Sendou et du Sénégal.';

export const metadata: Metadata = {
    title,
    description,
    keywords: suggestKeywords({ title, description })
};

export default function Page() {
    // Utilisation des données d'articles
    const articles = defaultPosts;

    return (
        <div style={{ padding: 20 }}>
            <h1>Articles de Blog — Hôtel Le Pays</h1>
            <ul>
                {articles.map((article) => (
                    <li key={article.slug}>
                        <Link href={`/blog-details/${article.slug}`}>
                            <a>
                                <h3>{article.title}</h3>
                                <p>{article.excerpt}</p>
                                <small>{article.date}</small>
                            </a>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}