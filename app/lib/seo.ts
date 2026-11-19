import { KeywordEntry, CompetitionLevel, HIGH_KEYWORDS, MEDIUM_KEYWORDS, LOW_KEYWORDS, UNSPECIFIED_KEYWORDS } from '@/app/types/keysWords';

const toEntries = (arr: { keyword: string; volume: number }[], competition: CompetitionLevel) =>
    arr.map(k => ({ ...k, competition }));

const ALL: KeywordEntry[] = [
    ...toEntries(HIGH_KEYWORDS, 'HIGH'),
    ...toEntries(MEDIUM_KEYWORDS, 'MEDIUM'),
    ...toEntries(LOW_KEYWORDS, 'LOW'),
    ...toEntries(UNSPECIFIED_KEYWORDS, 'UNSPECIFIED'),
];

// Pondérations par niveau de compétition (préférer LOW/MEDIUM pour la facilité de ranking)
const COMPETITION_WEIGHTS: Record<CompetitionLevel, number> = {
    HIGH: 0.6,
    MEDIUM: 0.9,
    LOW: 1.0,
    UNSPECIFIED: 0.8,
};

// Normalise et vérifie la présence d'un keyword dans un texte
const includesNormalized = (text: string, keyword: string) => text.includes(keyword);

// Calcul de la "présence" d'un keyword (extrait pour réduire la complexité)
function computePresence(kw: string, titleNorm: string, descNorm: string, combined: string): number {
    let presence = 0;
    if (titleNorm && includesNormalized(titleNorm, kw)) presence += 3; // titre pèse plus
    if (descNorm && includesNormalized(descNorm, kw)) presence += 1;

    if (presence === 0) {
        const words = kw.split(/\s+/).filter(Boolean);
        if (words.length > 0 && words.every(w => combined.includes(w))) {
            presence = 0.5; // correspondance partielle
        }
    }
    return presence;
}

// Génère des mots-clés scorés à partir du title et de la description
export function generateKeywordsFromContent(title?: string, description?: string, max = 6): string[] {
    const titleNorm = (title || '').toLowerCase();
    const descNorm = (description || '').toLowerCase();
    const combined = `${titleNorm} ${descNorm}`.trim();

    if (!combined) return [];

    const scored: { keyword: string; score: number; volume: number; competition: CompetitionLevel }[] = [];

    for (const k of ALL) {
        const kw = k.keyword.toLowerCase();
        const presence = computePresence(kw, titleNorm, descNorm, combined);
        if (presence === 0) continue; // pas pertinent pour ce contenu

        const weight = COMPETITION_WEIGHTS[k.competition] ?? 0.8;
        const score = (k.volume || 0) * weight * presence;
        scored.push({ keyword: k.keyword, score, volume: k.volume || 0, competition: k.competition });
    }

    // Trier par score décroissant puis par volume
    scored.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.volume - a.volume;
    });

    // Retourner keywords uniques (au cas où)
    const seen = new Set<string>();
    const result: string[] = [];
    for (const s of scored) {
        if (!seen.has(s.keyword)) {
            seen.add(s.keyword);
            result.push(s.keyword);
            if (result.length >= max) break;
        }
    }

    return result;
}

// Suggestion intelligente de keywords : title + description -> mots-clés
export function suggestKeywords({ title, description }: { title?: string; description?: string }, max = 6) {
    // Essayer une extraction ciblée (title + description)
    const keys = generateKeywordsFromContent(title, description, max);
    if (keys.length > 0) return keys;

    // Fallback mixé : privilégier LOW puis MEDIUM puis HIGH
    const fallback: string[] = [];
    const pushUnique = (arr: { keyword: string }[]) => {
        for (const it of arr) {
            if (fallback.length >= max) break;
            if (!fallback.includes(it.keyword)) fallback.push(it.keyword);
        }
    };

    pushUnique(LOW_KEYWORDS);
    if (fallback.length < max) pushUnique(MEDIUM_KEYWORDS);
    if (fallback.length < max) pushUnique(HIGH_KEYWORDS);

    return fallback.slice(0, max);
}

// Note: ancienne API generateKeywordsFromText supprimée (évite warning unused).
