// hotelData.ts



export type Currency =  {
    code: string;
    name: string;
    symbol: string;
    rateToEUR:number;
}


export type Feature = {
    title: string;
    description: string;
    image: string;
    img_bg: string;
};
export type BasicInfo = { icon: string; text: string };
export type DetailsInfos = { label: string; value: string };
export type Facilities = { icon: string; name: string };

export type Room = {
    name: string;
    slug: string;
    title: string;
    subtitle: string;
    type: string;
    guests: number;
    size: string;
    price: string;
    default_curency: Currency;
    description: string;
    basicInfo: BasicInfo[];
    details: DetailsInfos[];
    facilities: Facilities[];
    images: string[];
    image: string;
    link: string;
    // Propriété optionnelle pour les destinations (ex: options d'excursions)
    options?: DestinationOption[];
};

export type Suite = Room;

export type Testimonial = {
    name: string;
    role: string;
    image: string;
    thumb: string;
    text: string;
    rating: number;
    videoUrl?: string;
};


export type Comment = {
    id: string; // identifiant unique
    author: string; // nom de l'auteur
    date: string; // date du commentaire
    content: string; // contenu du commentaire
};
export type BlogPost = {
    title: string;
    slug: string;
    date: string;
    thumb: string;
    link: string;
    excerpt: string;
    html_content: string;
    images: string[];
    comments: Comment[];
    tags: any[];
    comments_number: number;
};


// Exemple d'objets adaptés pour defaultDestinations
export type DestinationOption = {
    name: string;
    price: string; // prix supplémentaire en XOF
    description: string;
};

export type GalleryImage = string;

// hotelData.ts

export type InstagramItem = {
    image: string;
    link?: string; // lien vers le profil ou le post
};

export type Service = {
    title: string;
    description?: string;
    iconClass?: string;
    image?: string;
    link?: string;
};


// fanfactsData.ts
export type Fanfact = {
    count: number | string;
    suffix?: string; // Exemple : K, M
    title: string;
};

export const fanfactsData: Fanfact[] = [
    { count: 21, title: "Chambres de luxes" }, // Nombre de chambres
    { count: 3, title: "Étoiles de l'Hôtel" }, // 3 étoiles
    { count: 1500, title: "Clients Satisfaits" }, // Nombre approximatif de clients
    { count: 95, suffix: "%", title: "Taux de Satisfaction" }, // Taux de satisfaction
];


export type SeoAboutData = {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    author?: string;
    robots?: string;
    images?: string[];
    openGraph?: any;
    twitter?: any;
    schema?: any;
    serviceAreas?: string[];
};

export type AboutData = {
    title?: string;
    description?: string;
    html_description?: string;
    html_description_image?: string;
    features?: string[];
    images?: string[];
    buttonText?: string;
    buttonLink?: string;
    seo?: SeoAboutData;
};




export type ExploreItemOption = {
    name: string;
    price: string;
    description: string;
};

export type ExploreItem = {
    /** Identité */
    name: string;
    slug: string;
    title: string;
    subtitle: string;
    type: string;

    /** Infos générales */
    location: string;
    size: string;
    description: string;

    /** Popularité & confiance */
    rating: number;      // ex: 4.7
    reviews: number;     // ex: 328
    tag?: string;        // ex: "Populaire", "Incontournable"

    /** Prix & devise */
    price: string;       // prix de base ou 0 si gratuit
    default_curency: Currency;

    /** Contenu UI */
    features: string[];  // ex: ["Safari", "Pirogue", "Photographie"]
    basicInfo: BasicInfo[];
    details: DetailsInfos[];
    facilities: Facilities[];

    /** Médias & navigation */
    images: string[];
    image: string;
    link: string;

    /** Options payantes */
    options?: ExploreItemOption[];
};

// faqData.ts
export type FAQ = {
    question: string;
    answer: string;
};

// roomsData.ts
export type Pricing = {
    title: string;
    price: number;
    name: string;
    currency?: string;
    per?: string;
    features: string[];
    link: string;
};

export type Extra = {
    name: string;
    price: number;
};

export type Slide = {
    background: string;
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    videoLink?: string;
    stars?: number;
};
export type HeroData = {
    type?: "image" | "slider" | "video";
    images?: string[];
    videoUrl?: string;
    title?: string;
    subtitle?: string;
    buttonText?: string;
    buttonLink?: string;
};

export type ImageBanner = {
    bgImage: string;
    videoUrl?: string;
    image?: string; // image affichée dans la boîte vidéo
    text?: string;
    buttonText?: string;
    buttonLink?: string;
};


export type BannerVideoData = {
    titleLines?: string[]; // Chaque ligne du titre
    highlight?: string; // Partie colorée
    buttonText?: string;
    buttonLink?: string;
    videoSrc?: string;
    videoPoster?: string; // image fallback
    description?: string;
    scrollText?: string;
};

export type ContactType = "phone" | "whatsapp" | "email" | "location"| "hours";
// types/contactData.ts
export type ContactInfoItem = {
    type: ContactType;
    title: string;
    value: string;
    icon?: string;
    number?: string;
    link?: string;
};

export type ContactData = {
    sectionTitle: string;
    sectionSubtitle: string;
    description: string;
    formAction: string;
    contactItems: ContactInfoItem[];
    mapSrc: string;
};


// Données par défaut pour Hôtel Le Pays


export type HeaderDataItem = {
    logo: string;
    logoSticky: string;
    logoMobile: string;

    menu: {
        title: string;
        link: string;
        subMenu?: {
            title: string;
            link: string;
        }[];
    }[];

    button: {
        text: string;
        link: string;
        arrowIcon: string;
    };

    contactInfo: ContactInfoItem[];
    socialLinks: {
        icon: string;
        link: string;
    }[];
};


export type RoomsData = {
    rooms?: Room[];
    title?: string;
};

// ---------- Types ----------
export type RoomParams = {
    type: "simple" | "double" | "familiale" | "suite" | "";
    adults: number;
    children: number;
    clim: "oui" | "non" | "";
};
export type RoomType = {
    value: string;
    label: string;
    hasClim: boolean;
    canHaveChildren: boolean;
};

export type Customer = {
    name: string;
    email: string;
    phone: string;
    whatsapp: boolean;
};

export type BookingInfos = {
    arrival: Date | null;
    departure: Date | null;
    numRooms: number;
    rooms: Record<string, RoomParams>;
    extras: string[];
    customer: Customer;
};

// /app/types/legalPagesData.ts
export type LegalPageData = {
    title: string;
    html_content: string;
    seo?: {
        metaTitle?: string;
        metaDescription?: string;
        keywords?: string[];
    };
};


export const defaultPosts: BlogPost[] = [
    {
        title: "Le Tourisme au Sénégal : Une Destination en Pleine Croissance",
        slug: "tourisme-senegal-destination-croissance", // Cohérent avec le titre
        date: "March 9, 2026",
        thumb: "/assets/images/blog/tourisme-senegal.jpg",
        link: "/blog-details/tourisme-senegal-destination-croissance",
        excerpt: "Explorez les raisons du succès fulgurant du Sénégal, entre investissements massifs dans les infrastructures et préservation d'une culture authentique.",
        tags: [
            "Tourisme",
            "Sénégal",
            "Destinations touristiques",
            "Écotourisme",
            "Sénégal Émergent",
            "Casamance",
            "Lompoul",
            "Investissements en Afrique",
            "Culture sénégalaise",
            "Île de Gorée",
            "Histoire du Sénégal",
            "Infrastructures touristiques"
        ],
        html_content: `
       <article>
    <p>Le Sénégal ne se contente plus d'être une simple escale en Afrique de l'Ouest ; il s'impose désormais comme le <strong>hub touristique majeur</strong> de la région. Porté par une stabilité politique exemplaire et une hospitalité (la <em>Teranga</em>) qui n'est plus à prouver, le pays attire chaque année des millions de voyageurs en quête d'évasion et d'authenticité.</p>

    <a href="/booking" class="cta-button">Réservez votre séjour à l'Hôtel Le Pays et découvrez le Sénégal autrement</a>

    <h3>1. Une Diversité de Paysages Unique</h3>
    <p>Du nord au sud, le Sénégal offre un contraste saisissant qui permet de multiplier les types de séjours :</p>
    <ul>
        <li><strong>Le Désert de Lompoul :</strong> Une immersion saharienne avec ses dunes orangées, idéale pour une nuit sous des tentes mauritaniennes de luxe.</li>
        <li><strong>Le Delta du Sine-Saloum :</strong> Classé parmi les plus belles baies du monde, ce labyrinthe de mangroves et de bolongs est le paradis de l'écotourisme.</li>
        <li><strong>La Casamance :</strong> Une région verdoyante, véritable jardin d'Éden où les forêts de fromagers majestueux rencontrent des plages sauvages.</li>
    </ul>

    <a href="/rooms-suites" class="cta-button">Découvrez nos chambres pour une expérience inoubliable</a>

    <blockquote>
        "Le Sénégal est une terre où chaque coucher de soleil raconte une histoire millénaire."
    </blockquote>

    <h3>2. Culture et Histoire : Un Patrimoine Vivant</h3>
    <p>Le tourisme sénégalais repose également sur un héritage culturel profond. L'<strong>Île de Gorée</strong> et l'<strong>Île de Saint-Louis</strong> (la Venise africaine) transportent les visiteurs dans le temps grâce à leur architecture coloniale préservée. Mais la culture, c'est aussi le présent : Dakar est devenue une capitale mondiale de l'art contemporain avec sa célèbre Biennale (Dak'Art) et son Monument de la Renaissance Africaine.</p>

    <a href="/booking" class="cta-button">Réservez dès maintenant pour explorer l'âme du Sénégal</a>

    <h3>3. Modernisation et Vision "Sénégal Émergent"</h3>
    <p>L'essor actuel s'explique aussi par des investissements structurels sans précédent :</p>
    <ul>
        <li><strong>Infrastructures :</strong> Le prolongement des autoroutes et la mise en service du TER facilitent l'accès aux zones reculées.</li>
        <li><strong>Pointe-Sarène :</strong> La création de nouvelles zones touristiques intégrées avec des complexes hôteliers de classe internationale.</li>
        <li><strong>Tourisme d'Affaires :</strong> Le CICAD (Centre International de Conférences Abdou Diouf) positionne le pays comme une destination clé pour le MICE (Meetings, Incentives, Conferences, Exhibitions).</li>
    </ul>

    <a href="/contact" class="cta-button">Contactez-nous pour organiser votre séjour d'affaires ou événement</a>

    <p>En conclusion, que vous soyez amateur de farniente sur la Petite Côte ou passionné d'ornithologie dans le parc du Djoudj, le Sénégal offre une expérience multisensorielle qui marque durablement l'esprit des voyageurs.</p>

    <a href="/booking" class="cta-button">Réservez votre expérience unique au cœur du Sénégal</a>
</article>
    `,

        images: [
            "/assets/images/blog/tourisme-senegal1.jpg",
            "/assets/images/blog/tourisme-senegal2.jpg",
            "/assets/images/blog/tourisme-senegal3.jpg"
        ],

        comments_number: 5,
        comments: [
            {
                id: "comm-001",
                author: "Fatou Diop",
                date: "March 9, 2026",
                content: "Article passionnant ! J'habite à Dakar et je vois l'évolution du tourisme d'affaires, c'est impressionnant."
            },
            {
                id: "comm-002",
                author: "Jean-Marc L.",
                date: "March 9, 2026",
                content: "Merci pour ces précisions sur Lompoul. C'est l'étape qui me manquait pour mon prochain circuit !"
            },
            {
                id: "comm-003",
                author: "Amadou Sow",
                date: "March 10, 2026",
                content: "La mention de la Casamance est essentielle, merci. C'est le poumon vert du pays."
            },
            {
                id: "comm-004",
                author: "Sophie Morel",
                date: "March 10, 2026",
                content: "Est-ce que vous auriez des recommandations d'écolodges dans le Sine-Saloum ?"
            },
            {
                id: "comm-005",
                author: "Ibrahima Fall",
                date: "March 10, 2026",
                content: "Très bonne analyse sur le plan 'Sénégal Émergent'. Le tourisme est le futur de notre économie."
            }
        ]
    },
    {
        title: "Que faire autour de Sendou : guide touristique complet",
        slug: "que-faire-sendou",
        date: "March 10, 2026",
        thumb: "/assets/images/blog/sendou-tourisme.jpg",
        link: "/blog-details/que-faire-sendou",
        excerpt: "Entre les falaises de Toubab Dialaw, la magie du Lac Rose et les réserves sauvages, découvrez pourquoi Sendou est le point de départ idéal pour explorer la Petite Côte.",
        tags: [
            "Tourisme",
            "Sendou",
            "Petite Côte",
            "Lac Rose",
            "Toubab Dialaw",
            "Réserve de Bandia",
            "Plages du Sénégal",
            "Écotourisme",
            "Tourisme culturel",
            "Port Minéralier de Bargny",
            "Vacances au Sénégal",
            "Aventure en Afrique"
        ],
        html_content: `
       <article>
    <p>Située à la charnière entre l'effervescence de Dakar et la sérénité de la Petite Côte, <strong>Sendou</strong> est une destination qui gagne à être connue. Longtemps restée dans l'ombre, cette localité offre aujourd'hui un visage authentique, mêlant tradition de pêche et projets de développement moderne.</p>

    <a href="/booking" class="cta-button">Réservez votre séjour à l'Hôtel Le Pays à Sendou</a>

    <h3>1. Détente et Sérénité sur le Littoral</h3>
    <p>Les plages bordant Sendou et Bargny offrent une alternative paisible aux zones ultra-touristiques. Ici, on prend le temps d'observer le retour des pirogues colorées au coucher du soleil. C'est un lieu privilégié pour ceux qui cherchent à s'imprégner de la vie locale loin des foules, tout en profitant des embruns de l'Atlantique.</p>

    <a href="/rooms-suites" class="cta-button">Découvrez nos chambres avec vue sur l'océan</a>

    <h3>2. Les Incontournables à Moins d'une Heure</h3>
    <p>Séjourner à Sendou, notamment à <strong>l'Hôtel Le Pays</strong>, vous place au centre d'un triangle d'activités exceptionnelles :</p>
    <ul>
        <li><strong>La Réserve de Bandia :</strong> À seulement 30 minutes, ce sanctuaire animalier vous permet d'observer girafes, rhinocéros, zèbres et antilopes lors d'un safari mémorable au milieu des baobabs centenaires.</li>
        <li><strong>Le Lac Rose (Lac Retba) :</strong> Bien que sa couleur varie selon l'ensoleillement et la concentration en sel, une visite aux ramasseurs de sel reste un spectacle fascinant et une expérience humaine forte.</li>
        <li><strong>Toubab Dialaw :</strong> Ce village d'artistes niché sur des falaises rouges est célèbre pour son architecture organique et ses spectacles de danse et de percussion. Un lieu bohème et inspirant.</li>
    </ul>

    <a href="/booking" class="cta-button">Réservez maintenant et explorez les merveilles autour de Sendou</a>

    <h3>3. Entre Industrie et Nature</h3>
    <p>Le contraste est l'essence même de cette zone. La visite du <strong>Port Minéralier de Bargny-Sendou</strong> offre un regard fascinant sur les ambitions économiques du Sénégal. C'est une immersion dans le futur industriel du pays, qui côtoie des écosystèmes fragiles qu'il est essentiel de découvrir pour comprendre les enjeux locaux.</p>

    <a href="/contact" class="cta-button">Contactez-nous pour organiser votre visite du port et ses environs</a>

    <blockquote>
        "Sendou n'est pas qu'un point de passage, c'est une escale stratégique pour quiconque souhaite découvrir l'âme de la côte sénégalaise sans sacrifier le confort."
    </blockquote>

    <h3>Conseils Pratiques</h3>
    <p>Pour profiter pleinement de votre séjour, nous vous recommandons de louer un véhicule tout-terrain pour explorer les pistes environnantes ou de faire appel aux guides locaux qui sauront vous dénicher les coins secrets du littoral, entre falaises et lagunes.</p>

    <a href="/booking" class="cta-button">Réservez votre véhicule et guide pour une aventure unique</a>
</article>
    `,

        images: [
            "/assets/images/blog/sendou1.jpg",
            "/assets/images/blog/sendou2.jpg"
        ],

        comments_number: 3,
        comments: [
            {
                id: "comm-101",
                author: "Malick Ndiaye",
                date: "March 10, 2026",
                content: "Excellent guide ! On oublie souvent que Sendou est juste à côté de Toubab Dialaw, c'est un combo parfait pour un week-end."
            },
            {
                id: "comm-102",
                author: "Claire Vallet",
                date: "March 10, 2026",
                content: "L'Hôtel Le Pays est en effet une très bonne adresse, l'accueil y est chaleureux et la vue sur la mer est imprenable."
            },
            {
                id: "comm-103",
                author: "Ousmane G.",
                date: "March 11, 2026",
                content: "La réserve de Bandia reste mon activité préférée dans le secteur. C'est génial de voir ces animaux de si près à deux pas de Dakar."
            }
        ]
    },
    {
        title: "Le Nouveau Port Minéralier de Bargny-Sendou : Un Pilier pour l'Économie du Sénégal",
        slug: "port-mineralier-bargny-sendou-economie",
        date: "March 10, 2026",
        thumb: "/assets/images/blog/port-mineralier-bargny.jpg",
        link: "/blog-details/port-mineralier-bargny-sendou-economie",
        excerpt: "Infrastructure monumentale et carrefour logistique, le port de Bargny-Sendou redéfinit les ambitions industrielles du Sénégal sur l'échiquier international.",
        tags: [
            "Port Minéralier",
            "Bargny-Sendou",
            "Infrastructure",
            "Économie du Sénégal",
            "Plan Sénégal Émergent",
            "Exportations sénégalaises",
            "Investissements en Afrique",
            "Industrie au Sénégal",
            "Logistique",
            "Phosphates",
            "Projets d'infrastructure",
            "Développement durable"
        ],
        html_content: `
      <article>
    <p>Le <strong>Port Minéralier et Vraquier de Bargny-Sendou</strong> n'est pas seulement un projet d'infrastructure ; c'est le nouveau poumon industriel du Sénégal. Situé à environ 25 km au sud de Dakar, ce complexe portuaire de nouvelle génération répond à l'urgence de désengorger le Port Autonome de Dakar tout en offrant une plateforme spécialisée pour les ressources naturelles du pays.</p>

    <a href="/investment-opportunities" class="cta-button">Explorez les opportunités d'investissement dans le Port de Bargny-Sendou</a>

    <h3>1. Une Vision Stratégique pour l'Émergence</h3>
    <p>Intégré au Plan Sénégal Émergent (PSE), ce port a été conçu pour traiter des volumes massifs de produits vraquiers (minerais, charbon, produits céréaliers et pondéreux). Grâce à un tirant d'eau exceptionnel de 18 mètres, il peut accueillir des navires de type <em>Post-Panamax</em>, positionnant le Sénégal comme un hub logistique incontournable en Afrique de l'Ouest.</p>

    <a href="/about" class="cta-button">En savoir plus sur le projet Port Minéralier et son impact stratégique</a>

    <h3>2. Les Chiffres Clés du Projet</h3>
    <ul>
        <li><strong>Capacité de traitement :</strong> Plus de 15 millions de tonnes par an en phase initiale.</li>
        <li><strong>Investissement :</strong> Plusieurs centaines de millions de dollars mobilisés via des partenariats publics-privés.</li>
        <li><strong>Emplois :</strong> Création de plus de 2 000 emplois directs et indirects durant les phases d'exploitation.</li>
        <li><strong>Infrastructures :</strong> Un terminal minéralier doté de convoyeurs automatisés et de zones de stockage haute capacité.</li>
    </ul>

    <a href="/careers" class="cta-button">Postulez aux emplois créés par le projet</a>

    <blockquote>
        "Ce port est le levier qui permettra au Sénégal de maximiser la valeur de ses exportations minières, notamment les phosphates et les futurs projets de fer."
    </blockquote>

    <h3>3. Impact Local et Développement Durable</h3>
    <p>Au-delà de l'aspect économique, le projet s'accompagne d'un volet social important pour les communautés de Bargny et Sendou. Des programmes de réinsertion et des investissements dans les infrastructures de base (écoles, santé) sont déployés pour que la croissance industrielle profite directement aux populations locales.</p>
    
    <a href="/social-impact" class="cta-button">Découvrez l'impact social et environnemental du port</a>

    <p>Le défi majeur reste la conciliation entre cette puissance industrielle et la préservation de l'écosystème côtier, un sujet suivi de près par les autorités environnementales pour garantir un développement respectueux des normes internationales.</p>

    <h3>Conclusion</h3>
    <p>Avec la mise en service complète de ses terminaux, le port de Bargny-Sendou devient le fer de lance de la souveraineté logistique sénégalaise, ouvrant une fenêtre directe sur les marchés mondiaux pour les ressources du pays.</p>

    <a href="/contact" class="cta-button">Contactez-nous pour plus d'informations sur le projet et ses opportunités</a>
</article>
    `,

        images: [
            "/assets/images/blog/port-mineralier-bargny1.jpg",
            "/assets/images/blog/port-mineralier-bargny2.jpg"
        ],

        comments_number: 10,
        comments: [
            { id: "c-01", author: "Moussa Diagne", date: "March 10, 2026", content: "Une infrastructure de cette taille est exactement ce dont le Sénégal a besoin pour booster ses exportations." },
            { id: "c-02", author: "Awa Thiam", date: "March 10, 2026", content: "Quid de l'impact sur les pêcheurs locaux de Bargny ? J'espère que les compensations seront à la hauteur." },
            { id: "c-03", author: "Dr. Mamadou Kane", date: "March 10, 2026", content: "Le tirant d'eau de 18m est un avantage compétitif énorme par rapport aux ports voisins." },
            { id: "c-04", author: "Saliou Ndir", date: "March 11, 2026", content: "Enfin un port spécialisé ! Cela va libérer Dakar des camions de minerais qui bloquent la ville." },
            { id: "c-05", author: "Fatou Binetou", date: "March 11, 2026", content: "Est-ce qu'il y a des formations prévues pour les jeunes de Sendou afin qu'ils travaillent sur le port ?" },
            { id: "c-06", author: "Jean-Luc G.", date: "March 11, 2026", content: "Impressionnant. Le Sénégal devient vraiment le moteur de la sous-région." },
            { id: "c-07", author: "Association Nature", date: "March 12, 2026", content: "Nous resterons vigilants quant à la gestion des poussières minéralières pour la santé des riverains." },
            { id: "c-08", author: "Omar Fall", date: "March 12, 2026", content: "Un projet structurant qui va attirer beaucoup d'investisseurs dans la zone industrielle." },
            { id: "c-09", author: "Ismaïla Sarr", date: "March 12, 2026", content: "Le lien avec le chemin de fer est-il déjà opérationnel pour le transport des minerais ?" },
            { id: "c-10", author: "Khadija", date: "March 12, 2026", content: "Fière de voir mon pays se doter de tels outils de développement. Vive l'émergence !" }
        ]
    },
    {
        title: "La Réserve de Bandia : Un Voyage au Cœur de la Nature Sénégalaise",
        slug: "reserve-de-bandia-senegal",
        date: "March 12, 2026",
        thumb: "/assets/images/blog/reserve-bandia.jpg",
        link: "/blog-details/reserve-bandia",
        excerpt: "Vivez l'expérience unique d'un safari à seulement une heure de Dakar : entre girafes majestueuses, rhinocéros blancs et baobabs millénaires.",
        tags: [
            "Réserve de Bandia",
            "Safari au Sénégal",
            "Faune sénégalaise",
            "Girafes",
            "Rhinocéros Blanc",
            "Baobabs géants",
            "Parc naturel",
            "Biodiversité",
            "Conservation des espèces",
            "Écotourisme",
            "Tourisme au Sénégal",
            "Safari en Afrique"
        ],
        html_content: `
       <article>
    <p>À seulement 65 kilomètres de l'agitation dakaroise, la <strong>Réserve de Bandia</strong> offre une parenthèse sauvage exceptionnelle. S'étendant sur 3 500 hectares de forêt de baobabs et d'acacias, ce sanctuaire est le premier parc de faune privée du Sénégal à avoir réussi le pari de réintroduire de grands mammifères d'Afrique de l'Ouest et du Sud.</p>

    <a href="/booking" class="cta-button">Réservez votre safari à la Réserve de Bandia</a>

    <h3>1. Un Safari Immersif à Portée de Main</h3>
    <p>L'aventure commence dès l'entrée du parc, où vous embarquez à bord de véhicules tout-terrain spécialement aménagés. Contrairement à un zoo, les animaux évoluent ici en semi-liberté. C'est l'occasion rare d'observer de près :</p>
    <ul>
        <li><strong>La Girafe de Lord Derby :</strong> Majestueuse, elle se nourrit des cimes des acacias sous vos yeux.</li>
        <li><strong>Le Rhinocéros Blanc :</strong> Une force de la nature, protégé ici dans le cadre de programmes de conservation.</li>
        <li><strong>Les Antilopes :</strong> Des Élands du Cap aux Oryx, en passant par les Grands Koudous et les Impalas.</li>
        <li><strong>La Faune Aquatique :</strong> Le bassin aux crocodiles et les nombreux varans qui peuplent les points d'eau.</li>
    </ul>

    <a href="/safari-tours" class="cta-button">Découvrez nos circuits safari et réservez votre aventure</a>

    <h3>2. Bien plus que des Animaux : Un Patrimoine Naturel</h3>
    <p>Le décor de Bandia est un personnage à part entière. La réserve abrite une forêt de <strong>baobabs géants</strong>, certains étant plusieurs fois centenaires. Ne manquez pas le "Baobab Tombeau", un arbre sacré qui servait autrefois de sépulture aux griots, témoignant du lien indéfectible entre nature et culture sénégalaise.</p>

    <a href="/about" class="cta-button">En savoir plus sur la Réserve de Bandia et son histoire</a>

    <blockquote>
        "Bandia n'est pas seulement une réserve, c'est un conservatoire de la biodiversité où le silence de la savane n'est rompu que par le chant des oiseaux tropicaux."
    </blockquote>

    <h3>3. Une Expérience Gastronomique en Savane</h3>
    <p>Pour conclure votre safari, le restaurant de la réserve offre une vue imprenable sur un point d'eau fréquenté par les buffles et les singes patas. Déguster un plat local tout en observant les animaux venir s'abreuver est un moment de pure magie qui ravit les photographes et les familles.</p>

    <a href="/restaurant" class="cta-button">Réservez votre table pour une expérience gastronomique inoubliable</a>

    <p><strong>Conseil pratique :</strong> Pour une lumière optimale et une activité animale intense, privilégiez les visites tôt le matin ou en fin d'après-midi.</p>

    <a href="/contact" class="cta-button">Contactez-nous pour plus de détails ou des conseils pratiques</a>
</article>
    `,

        images: [
            "/assets/images/blog/reserve-bandia1.jpg",
            "/assets/images/blog/reserve-bandia2.jpg",
            "/assets/images/blog/reserve-bandia3.jpg"
        ],

        comments_number: 7,
        comments: [
            { id: "b-001", author: "Mariama Fall", date: "March 12, 2026", content: "Une expérience inoubliable ! Les enfants ont adoré voir les girafes de si près." },
            { id: "b-002", author: "Thomas L.", date: "March 12, 2026", content: "Le guide était excellent, il connaissait parfaitement l'histoire du baobab tombeau." },
            { id: "b-003", author: "Youssou Nd.", date: "March 13, 2026", content: "C'est l'endroit idéal pour déconnecter de Dakar le temps d'un après-midi. Je recommande !" },
            { id: "b-004", author: "Elena Rossi", date: "March 13, 2026", content: "J'ai été impressionnée par la proximité avec les rhinocéros. Très bien organisé." },
            { id: "b-005", author: "Abdoulaye Wade", date: "March 13, 2026", content: "Le restaurant au bord de l'eau est vraiment le point fort après le safari. Très reposant." },
            { id: "b-006", author: "Cécile Morel", date: "March 14, 2026", content: "Y a-t-il besoin de réserver le 4x4 à l'avance ou on peut le faire sur place ?" },
            { id: "b-007", author: "Pape Diop", date: "March 14, 2026", content: "Un trésor national. La conservation des espèces est un sujet crucial pour notre pays." }
        ]
    },
    {
        title: "Le Village des Tortues : Un Sanctuaire pour la Biodiversité Sénégalaise",
        slug: "village-des-tortues-senegal",
        date: "March 14, 2026",
        thumb: "/assets/images/blog/village-tortues.jpg",
        link: "/blog-details/village-tortues",
        excerpt: "Plongez au cœur de la conservation animale à Noflaye. Découvrez les tortues géantes et les efforts passionnés pour sauver les espèces menacées du Sahel.",
        tags: [
            "Village des Tortues",
            "Conservation des tortues",
            "Biodiversité sénégalaise",
            "Tortue Sulcata",
            "Protection des animaux",
            "Sahel",
            "Noflaye",
            "Faune et flore",
            "Écotourisme",
            "Conservation des espèces",
            "Activités familiales",
            "Artisanat solidaire"
        ],
        html_content: `
        <article>
    <p>Situé dans la forêt classée de Noflaye, le <strong>Village des Tortues</strong> est bien plus qu'une simple attraction touristique. C'est un centre de protection et de repeuplement dédié à la sauvegarde des chéloniens, dont certaines espèces sont aujourd'hui gravement menacées par l'urbanisation et le commerce illégal.</p>

    <a href="/booking" class="cta-button">Réservez votre visite au Village des Tortues</a>

    <h3>1. Une Mission de Conservation Cruciale</h3>
    <p>Le centre joue un rôle vital dans la survie de la <strong>tortue sillonnée (Centrochelys sulcata)</strong>, la plus grande tortue terrestre d'Afrique. Les visiteurs peuvent y observer le cycle de vie complet :</p>
    <ul>
        <li><strong>La Nurserie :</strong> Où les œufs sont protégés et les juvéniles surveillés jusqu'à ce qu'ils soient assez robustes.</li>
        <li><strong>Les Enclos de Croissance :</strong> Où des spécimens impressionnants pouvant peser jusqu'à 100 kg déambulent paisiblement.</li>
        <li><strong>Le Programme de Réintroduction :</strong> Une partie des tortues nées ici est relâchée dans des réserves protégées du Ferlo pour restaurer les populations sauvages.</li>
    </ul>

    <a href="/conservation" class="cta-button">En savoir plus sur nos actions de conservation des tortues</a>

    <h3>2. Une Diversité Fascinante</h3>
    <p>Bien que les tortues terrestres soient les stars du village, le site abrite également :</p>
    <p>Les <strong>tortues pélomeduses</strong> (aquatiques) et des espèces forestières. Le parcours pédagogique permet aussi de comprendre l'importance des zones humides et de la flore locale qui compose l'alimentation de ces reptiles millénaires.</p>

    <a href="/about" class="cta-button">Découvrez la biodiversité du Village des Tortues</a>

    <blockquote>
        "Apprendre à respecter le rythme de la tortue, c'est apprendre à respecter le rythme de la nature elle-même."
    </blockquote>

    <h3>3. Éducation et Engagement Local</h3>
    <p>Le Village des Tortues se veut un espace de sensibilisation. Des guides passionnés expliquent aux écoliers et aux voyageurs l'importance écologique de chaque espèce. En visitant le centre, vous contribuez directement au financement des programmes de soins et à l'entretien des habitats naturels du parc.</p>

    <a href="/support" class="cta-button">Soutenez nos programmes de protection des tortues</a>

    <p><strong>Note aux visiteurs :</strong> La boutique d'artisanat solidaire sur place permet de ramener des souvenirs dont les bénéfices servent au fonctionnement de l'association de protection.</p>

    <a href="/shop" class="cta-button">Découvrez la boutique solidaire du Village des Tortues</a>
</article>
    `,

        images: [
            "/assets/images/blog/village-tortues1.jpg",
            "/assets/images/blog/village-tortues2.jpg"
        ],

        comments_number: 11,
        comments: [
            { id: "t-01", author: "Aïssatou Ba", date: "March 14, 2026", content: "Un endroit magnifique pour une sortie en famille. Les enfants ont adoré la nurserie !" },
            { id: "t-02", author: "Marc Lefebvre", date: "March 14, 2026", content: "Les guides sont vraiment passionnés, on apprend énormément sur la tortue Sulcata." },
            { id: "t-03", author: "Modou Fall", date: "March 14, 2026", content: "Important de préciser que c'est à Noflaye, un havre de paix loin du bruit." },
            { id: "t-04", author: "Chloé D.", date: "March 15, 2026", content: "Voir ces tortues géantes de si près est impressionnant. Elles sont si calmes." },
            { id: "t-05", author: "Ibrahima Seck", date: "March 15, 2026", content: "Le travail de réintroduction dans le Ferlo est admirable. Bravo à l'équipe." },
            { id: "t-06", author: "Sarah Jane", date: "March 15, 2026", content: "Est-ce que le centre est ouvert les jours fériés ?" },
            { id: "t-07", author: "Sidy", date: "March 16, 2026", content: "J'y suis allé le week-end dernier, l'entrée est très abordable et c'est pour la bonne cause." },
            { id: "t-08", author: "Aminata", date: "March 16, 2026", content: "Une belle leçon d'humilité face à ces animaux qui vivent si longtemps." },
            { id: "t-09", author: "Dr. Diallo", date: "March 16, 2026", content: "La biodiversité sénégalaise a besoin de plus de centres comme celui-ci." },
            { id: "t-10", author: "Karim", date: "March 17, 2026", content: "La forêt de Noflaye autour est aussi très belle pour une petite marche." },
            { id: "t-11", author: "Lucie", date: "March 17, 2026", content: "N'oubliez pas d'acheter un souvenir à la boutique, les fonds aident vraiment les tortues !" }
        ]
    },
    {
        title: "Le Lac Rose : Un Voyage Mystique au Sénégal",
        slug: "lac-rose-senegal",
        date: "March 16, 2026",
        thumb: "/assets/images/blog/lac-rose.jpg",
        link: "/blog-details/lac-rose",
        excerpt: "Entre dunes de sable et eaux rosées, découvrez le Lac Retba : un chef-d'œuvre de la nature célèbre pour son sel et son histoire légendaire.",
        tags: [
            "Lac Rose",
            "Lac Retba",
            "Tourisme au Sénégal",
            "Dunes de sable",
            "Rallye Paris-Dakar",
            "Extrême salinité",
            "Récolte du sel",
            "Biodiversité",
            "Nature et aventure",
            "Activités en plein air",
            "Safari en 4x4",
            "Écotourisme"
        ],
        html_content: `
       <article>
    <p>Situé à seulement 35 kilomètres au nord-est de Dakar, le <strong>Lac Retba</strong>, plus connu sous le nom de <strong>Lac Rose</strong>, est une merveille géologique nichée entre les dunes et l'océan Atlantique. Sa renommée mondiale n'est pas usurpée : c'est un spectacle visuel saisissant où le bleu du ciel, le blanc du sel et le rose de l'eau se rencontrent.</p>

    <a href="/booking" class="cta-button">Réservez votre excursion au Lac Rose</a>

    <h3>1. Le Secret de sa Couleur</h3>
    <p>Le mystère de sa teinte rose réside dans la présence d'une algue microscopique, la <em>Dunaliella salina</em>. Sous l'effet des rayons du soleil et de la forte concentration en sel, ce micro-organisme fabrique des pigments rouges pour se protéger, donnant au lac ses reflets variant du mauve au rose fuchsia selon la luminosité.</p>

    <a href="/about" class="cta-button">Découvrez les secrets du Lac Rose et sa couleur fascinante</a>

    <h3>2. L'Or Blanc du Lac</h3>
    <p>Le Lac Rose est aussi un site économique majeur. Depuis des décennies, des centaines de récolteurs s'immergent quotidiennement dans ses eaux pour extraire le sel manuellement. Indispensable à la conservation des aliments, ce sel est empilé sur les berges en monticules étincelants, créant un paysage lunaire absolument fascinant pour les photographes.</p>

    <a href="/cultural-activities" class="cta-button">Explorez l'impact économique et culturel du Lac Rose</a>

    <blockquote>
        "Se baigner dans le Lac Rose est une expérience inoubliable : avec une salinité atteignant 380 grammes par litre, vous flottez sans aucun effort, tout comme dans la Mer Morte."
    </blockquote>

    <h3>3. Activités et Aventures</h3>
    <p>Au-delà de l'aspect contemplatif, le Lac Rose offre une multitude d'activités pour les amateurs de sensations :</p>
    <ul>
        <li><strong>Traversée en pirogue :</strong> Pour aller à la rencontre des ramasseurs de sel et comprendre leur travail acharné.</li>
        <li><strong>Safari en 4x4 ou Quad :</strong> Pour parcourir les dunes de sable qui entourent le lac, sur les traces de l'arrivée mythique de l'ancien rallye <strong>Paris-Dakar</strong>.</li>
        <li><strong>Détente :</strong> Une pause déjeuner dans l'un des nombreux restaurants sur pilotis pour savourer un Thieboudienne face au lac.</li>
    </ul>

    <a href="/activities" class="cta-button">Réservez vos activités au Lac Rose : Pirogue, 4x4, Quad et plus</a>

    <p><strong>Note pratique :</strong> Pour voir le lac dans sa couleur la plus intense, privilégiez une visite entre les mois de novembre et juin, lors de la saison sèche, par une journée très ensoleillée.</p>

    <a href="/contact" class="cta-button">Contactez-nous pour plus de conseils pratiques sur votre visite</a>
</article>
    `,

        images: [
            "/assets/images/blog/lac-rose1.jpg",
            "/assets/images/blog/lac-rose2.jpg",
            "/assets/images/blog/lac-rose3.jpg"
        ],

        comments_number: 6,
        comments: [
            { id: "lr-01", author: "Babacar Sy", date: "March 16, 2026", content: "Flotter sur le lac est vraiment une sensation étrange et géniale ! N'oubliez pas de bien vous rincer à l'eau douce après." },
            { id: "lr-02", author: "Emma Watson", date: "March 16, 2026", content: "Le contraste entre les dunes de sable fin et l'eau rose est à couper le souffle. Les photos ne rendent pas justice à la réalité." },
            { id: "lr-03", author: "Lamine Ndiaye", date: "March 16, 2026", content: "Respect total aux ramasseurs de sel. C'est un travail titanesque dans des conditions difficiles." },
            { id: "lr-04", author: "Julien Faure", date: "March 17, 2026", content: "J'ai fait la balade en quad dans les dunes, c'était le moment fort de mon voyage au Sénégal !" },
            { id: "lr-05", author: "Ndeye Fatou", date: "March 17, 2026", content: "Dommage que le niveau de l'eau ait beaucoup monté ces dernières années, mais le site reste magique." },
            { id: "lr-06", author: "Marc Antoine", date: "March 18, 2026", content: "Conseil : demandez aux guides locaux de vous expliquer l'histoire de l'arrivée du rallye, c'est passionnant." }
        ]
    },
    {
        title: "Toubab Dialaw : L'Écrin Artistique entre Terre et Mer",
        slug: "toubab-dialaw-tourisme-culture",
        date: "March 16, 2026",
        thumb: "/assets/images/blog/toubab-dialaw.jpg",
        link: "/blog-details/toubab-dialaw-tourisme",
        excerpt: "Niché sur des falaises de roche rouge, Toubab Dialaw est le refuge secret des artistes et des voyageurs en quête de sérénité et d'inspiration.",
        tags: [
            "Toubab Dialaw",
            "Art au Sénégal",
            "Danse africaine",
            "École des Sables",
            "Architecture organique",
            "Sobo Badè",
            "Falaises rouges",
            "Plages secrètes",
            "Retraite spirituelle",
            "Yoga et méditation",
            "Tourisme culturel",
            "Voyage au Sénégal"
        ],
        html_content: `
     <article>
    <p>À environ 50 kilomètres au sud de Dakar, là où la savane rencontre brusquement l'océan, se dresse <strong>Toubab Dialaw</strong>. Ce village de pêcheurs s'est transformé au fil des décennies en un sanctuaire pour la création artistique, attirant chorégraphes, peintres et musiciens du monde entier.</p>

    <a href="/booking" class="cta-button">Réservez votre séjour à Toubab Dialaw</a>

    <h3>1. Une Architecture Organique Unique</h3>
    <p>Ce qui frappe d'abord à Toubab Dialaw, c'est son intégration parfaite dans le paysage. Contrairement aux stations balnéaires classiques, les constructions ici — souvent faites de pierres locales et de formes arrondies — semblent pousser à même la falaise. L'emblématique complexe <em>Sobo Badè</em> en est le meilleur exemple, avec ses mosaïques colorées et ses jardins suspendus qui surplombent l'Atlantique.</p>

    <a href="/about" class="cta-button">Explorez l'architecture unique de Toubab Dialaw</a>

    <h3>2. L'École des Sables : Un Hub Mondial de la Danse</h3>
    <p>Le village doit une grande partie de sa renommée internationale à l'<strong>École des Sables</strong>, fondée par Germaine Acogny. Ce centre d'enseignement des danses traditionnelles et contemporaines d'Afrique est un lieu de rencontre unique où le mouvement du corps répond au rythme des vagues. Il n'est pas rare de croiser des danseurs de tous continents répétant sur le sable fin au coucher du soleil.</p>

    <a href="/school" class="cta-button">Découvrez l'École des Sables et son programme</a>

    <blockquote>
        "À Toubab Dialaw, le temps semble suspendu. On n'y vient pas seulement pour voir, on y vient pour ressentir et créer."
    </blockquote>

    <h3>3. Entre Falaises Rouges et Plages Secrètes</h3>
    <p>La géographie du lieu est spectaculaire :</p>
    <ul>
        <li><strong>Les Falaises de Latérite :</strong> Leurs teintes rouges contrastent magnifiquement avec le bleu turquoise de la mer, offrant des sentiers de randonnée offrant des panoramas à couper le souffle.</li>
        <li><strong>La Plage du Village :</strong> Un lieu de vie vibrant où l'on observe le retour des pêcheurs et où l'on peut déguster des poissons grillés pieds dans l'eau.</li>
        <li><strong>Sérénité et Méditation :</strong> L'absence de grands complexes hôteliers bruyants en fait un endroit privilégié pour le yoga, la méditation et le ressourcement.</li>
    </ul>

    <a href="/activities" class="cta-button">Réservez vos activités à Toubab Dialaw : randonnée, plage et méditation</a>

    <p>Que vous soyez passionné d'art, amateur de paysages sauvages ou simplement à la recherche d'une retraite paisible, Toubab Dialaw saura vous envoûter par son âme singulière.</p>

    <a href="/contact" class="cta-button">Contactez-nous pour plus d'informations sur votre séjour à Toubab Dialaw</a>
</article>
    `,

        images: [
            "/assets/images/blog/toubab-dialaw1.jpg",
            "/assets/images/blog/toubab-dialaw2.jpg"
        ],

        comments_number: 3,
        comments: [
            {
                id: "td-001",
                author: "Seynabou Ly",
                date: "March 16, 2026",
                content: "Sobo Badè est mon endroit préféré au monde. L'architecture est tout simplement magique !"
            },
            {
                id: "td-002",
                author: "Julien R.",
                date: "March 17, 2026",
                content: "J'ai eu la chance de voir un spectacle à l'École des Sables, une expérience spirituelle intense. Merci pour cet article."
            },
            {
                id: "td-003",
                author: "Khadija G.",
                date: "March 17, 2026",
                content: "Les falaises rouges au coucher du soleil... il n'y a rien de plus beau au Sénégal pour faire des photos."
            }
        ]
    },
    {
        title: "Pourquoi séjourner à Sendou près de Dakar : Le compromis parfait",
        slug: "sejourner-sendou-dakar-guide",
        date: "March 17, 2026",
        thumb: "/assets/images/blog/sendou-hotel.jpg",
        link: "/blog-details/sejourner-sendou",
        excerpt: "Évitez les embouteillages de la capitale et profitez d'un cadre authentique. Découvrez pourquoi Sendou est devenu le nouveau refuge stratégique des voyageurs au Sénégal.",
        tags: [
            "Sendou",
            "Séjour au Sénégal",
            "Proximité de Dakar",
            "Hôtel Le Pays",
            "Tourisme à Sendou",
            "Petite Côte",
            "Voyage d'affaires Sénégal",
            "Calme et sérénité",
            "Culture locale",
            "Hébergement au Sénégal",
            "Escapade près de Dakar",
            "Investir à Sendou"
        ],
        html_content: `
        <article>
    <p>Choisir son lieu de résidence lors d'un voyage au Sénégal peut s'avérer complexe : faut-il s'immerger dans l'énergie débordante de Dakar ou s'isoler sur la Petite Côte ? <strong>Sendou</strong> apporte la réponse idéale. Ce village côtier, situé à la lisière de Rufisque, s'impose comme une alternative stratégique pour ceux qui recherchent calme, authenticité et mobilité.</p>

    <a href="/booking" class="cta-button">Réservez votre séjour à Sendou dès maintenant</a>

    <h3>1. Un Carrefour Stratégique Exceptionnel</h3>
    <p>L'avantage majeur de Sendou réside dans sa position géographique. En séjournant ici, vous êtes au centre de gravité des pôles d'intérêt majeurs :</p>
    <ul>
        <li><strong>Proximité de l'AIBD :</strong> À seulement 30 minutes de l'Aéroport International Blaise Diagne, vous évitez les longues heures de transfert vers le centre de Dakar.</li>
        <li><strong>Accès Rapide à Diamniadio :</strong> Le nouveau pôle urbain et ses centres de conférences sont à votre porte, idéal pour les voyageurs d'affaires.</li>
        <li><strong>La Porte de la Petite Côte :</strong> Vous êtes déjà sur la route vers Mbour, Saly et le Sine-Saloum, tout en restant assez proche de la capitale pour des excursions d'une journée.</li>
    </ul>

    <a href="/about" class="cta-button">En savoir plus sur la localisation stratégique de Sendou</a>

    <h3>2. Un Havre de Paix Loin du Tumulte</h3>
    <p>Dakar est magnifique, mais son intensité peut être épuisante. Sendou offre un <strong>microclimat de sérénité</strong>. Ici, les journées sont rythmées par le bruit des vagues et le retour des pêcheurs. C'est l'endroit parfait pour se ressourcer après une journée de visites ou de réunions, tout en profitant d'un air marin bien plus pur que dans le centre-ville pollué.</p>

    <a href="/activities" class="cta-button">Découvrez les activités tranquilles à Sendou : plage, pêche et plus</a>

    <blockquote>
        "Séjourner à Sendou, c'est choisir de vivre le Sénégal vrai, celui de la Teranga sans les filtres des zones ultra-touristiques."
    </blockquote>

    <h3>3. Le Confort au Meilleur Prix</h3>
    <p>Le rapport qualité-prix à Sendou est imbattable. Vous y trouverez des établissements de charme comme <strong>l'Hôtel Le Pays</strong>, offrant des prestations haut de gamme (piscine, vue mer, gastronomie locale) à des tarifs bien plus accessibles que les grands hôtels du Plateau ou des Almadies. C'est le choix malin pour prolonger son séjour sans sacrifier son budget.</p>

    <a href="/rooms-suites" class="cta-button">Découvrez nos chambres à l'Hôtel Le Pays</a>

    <h3>4. Une Immersion Culturelle Immédiate</h3>
    <p>Contrairement aux stations balnéaires fermées, Sendou vous permet de côtoyer la réalité sénégalaise. Baladez-vous dans le village, visitez le port de Bargny juste à côté, ou discutez avec les artisans locaux. C'est cette dimension humaine qui transforme un simple voyage en une expérience de vie mémorable.</p>

    <a href="/culture" class="cta-button">Plongez dans la culture locale à Sendou</a>
</article>
    `,

        images: [
            "/assets/images/blog/sendou-hotel1.jpg",
            "/assets/images/blog/sendou-hotel2.jpg"
        ],

        comments_number: 15,
        comments: [
            { id: "s-01", author: "Abdou Aziz", date: "March 17, 2026", content: "Depuis que j'ai découvert Sendou, je ne loge plus jamais en centre-ville. Le calme n'a pas de prix." },
            { id: "s-02", author: "Marie-Claire", date: "March 17, 2026", content: "Parfait pour ma dernière nuit avant de reprendre l'avion. Très proche de l'aéroport !" },
            { id: "s-03", author: "Pape Samba", date: "March 17, 2026", content: "L'Hôtel Le Pays est vraiment le top dans le secteur. La cuisine est excellente." },
            { id: "s-04", author: "Jean-Philippe", date: "March 18, 2026", content: "On évite les bouchons monstres de la sortie de Dakar, c'est un gain de temps énorme." },
            { id: "s-05", author: "Fatou Kiné", date: "March 18, 2026", content: "Le village est très accueillant, on se sent vraiment en sécurité." },
            { id: "s-06", author: "Lucas Martin", date: "March 18, 2026", content: "Est-ce qu'il y a des taxis faciles à trouver pour aller vers Toubab Dialaw ?" },
            { id: "s-07", author: "Sophie B.", date: "March 19, 2026", content: "Oui Lucas, les taxis clandos et les chauffeurs privés pullulent, c'est très simple." },
            { id: "s-08", author: "Ousmane G.", date: "March 19, 2026", content: "Le poisson grillé au bord de l'eau à Sendou... un délice !" },
            { id: "s-09", author: "Céline G.", date: "March 19, 2026", content: "Idéal pour le télétravail. La connexion internet dans les hôtels est correcte ?" },
            { id: "s-10", author: "Mamadou Fall", date: "March 20, 2026", content: "À l'Hôtel Le Pays, la fibre fonctionne très bien, j'y ai travaillé une semaine." },
            { id: "s-11", author: "Inès", date: "March 20, 2026", content: "Un petit paradis caché. Ne le dites pas trop fort, on veut garder le calme !" },
            { id: "s-12", author: "Patrick", date: "March 20, 2026", content: "La proximité avec la réserve de Bandia est un gros plus pour les sorties du dimanche." },
            { id: "s-13", author: "Awa Diop", date: "March 21, 2026", content: "J'aime beaucoup marcher le long de la plage jusqu'à Bargny le matin." },
            { id: "s-14", author: "Gérard", date: "March 21, 2026", content: "Le personnel des établissements à Sendou connaît vraiment le sens du mot Teranga." },
            { id: "s-15", author: "Saliou N.", date: "March 21, 2026", content: "C'est l'avenir du tourisme périurbain à Dakar. Très bonne analyse." }
        ]
    }
];

// Données Hôtel Le Pays
export const hotelDefaultInfo  = {
    name: "Hôtel Le Pays",
    rating: 3,
    location: "Sendou, Sénégal",
    description: "Hôtel 3 étoiles situé à Sendou, confortable et chaleureux, offrant un service de qualité et des installations adaptées à tous types de voyageurs.",

    contacts: {
        phone: "+221 33 836 02 76",
        email: "hotellepays@gmail.com",
        whatsapp: "+221 77 698 6382"
    },

    urlBase: "https://preprod.www.hotellepays.com/booking",

    checkin: "14:00",
    checkout: "11:00",

    roomTypes: [
        {
            type: "Standard",
            capacity: { adults: 2, children: 1 },
            price: 20000,
            clim: false
        },
        {
            type: "Standard Clim",
            capacity: { adults: 2, children: 1 },
            price: 25000,
            clim: true
        },
        {
            type: "Familiale",
            capacity: { adults: 4, children: 2 },
            price: 25000,
            clim: true
        },
        {
            type: "Suite",
            capacity: { adults: 2, children: 2 },
            price: 60000,
            inclusions: ["Climatisation", "Piscine", "Salle de sport", "Spa", "Jacuzzi"]
        }
    ],

    extras: [
        { name: "Petit-déjeuner", paidOnSite: true },
        { name: "Déjeuner", paidOnSite: true },
        { name: "Dîner", paidOnSite: true },
        { name: "Pack repas", paidOnSite: true },
        { name: "Blanchisserie", paidOnSite: true },
        { name: "Parking", paidOnSite: true },
        { name: "Piscine", paidOnSite: false, includedForSuite: true },
        { name: "Salle de sport", paidOnSite: false, includedForSuite: true },
        { name: "Spa", paidOnSite: false, includedForSuite: true },
        { name: "Jacuzzi", paidOnSite: false, includedForSuite: true }
    ],

    notes: {
        prefill: "Les réservations peuvent être préremplies via URL en utilisant des paramètres simples (arrival, departure, numRooms, extras) ou des objets JSON encodés (base64 recommandé) pour rooms, extrasQty et customer.",
        dateFormat: "Les dates doivent être au format YYYY-MM-DDTHH:mm (datetime-local).",
        reservationNumberFormat: "RCHLP00YYYYMMDDHHMMSS, sans parenthèses."
    },

    examples: [
        {
            customer: "Jean Dupont",
            rooms: ["double", "simple"],
            extras: ["Petit-déjeuner", "Parking"],
            url: "https://preprod.www.hotellepays.com/booking?arrival=2026-01-20T15%3A00&departure=2026-01-22T11%3A00&numRooms=2&rooms=%7B%22room1%22%3A%7B%22type%22%3A%22double%22%2C%22adults%22%3A2%2C%22children%22%3A1%2C%22clim%22%3A%22oui%22%7D%2C%22room2%22%3A%7B%22type%22%3A%22simple%22%2C%22adults%22%3A1%2C%22children%22%3A0%2C%22clim%22%3A%22non%22%7D%7D&extras=Petit-dejeuner%2CParking&extrasQty=%7B%22Petit-dejeuner%22%3A3%2C%22Parking%22%3A1%7D&customer=%7B%22name%22%3A%22Jean%20Dupont%22%2C%22email%22%3A%22jean.dupont%40example.com%22%2C%22phone%22%3A%22%2B221776986382%22%2C%22whatsapp%22%3Atrue%7D"
        },
        {
            customer: "Marie Curie",
            rooms: ["suite"],
            extras: ["Piscine", "Spa", "Jacuzzi"],
            url: "https://preprod.www.hotellepays.com/booking?arrival=2026-02-14T14%3A00&departure=2026-02-16T10%3A00&numRooms=1&rooms=%7B%22room1%22%3A%7B%22type%22%3A%22suite%22%2C%22adults%22%3A2%2C%22children%22%3A0%2C%22clim%22%3A%22oui%22%7D%7D&extras=Piscine%2CSpa%2CJacuzzi&extrasQty=%7B%22Piscine%22%3A2%2C%22Spa%22%3A2%2C%22Jacuzzi%22%3A2%7D&customer=%7B%22name%22%3A%22Marie%20Curie%22%2C%22email%22%3A%22marie.curie%40example.com%22%2C%22phone%22%3A%22%2B221778889900%22%2C%22whatsapp%22%3Atrue%7D"
        }
    ],

    faq: [
        {
            keywords: ["prix", "tarif", "coûte", "chambre"],
            answer: "Nos tarifs commencent à 20 000 FCFA pour une chambre standard ventilée et 25 000 FCFA avec climatisation. Pour une suite, comptez 60 000 FCFA, incluant climatisation, piscine, salle de sport, spa et jacuzzi."
        },
        {
            keywords: ["piscine", "baignade"],
            answer: "Oui, nous avons une piscine extérieure ouverte de 9h à 23h. L’accès est inclus pour les suites et payant pour les autres chambres selon la sélection."
        },
        {
            keywords: ["suite", "inclus", "piscine", "salle de sport", "spa", "jacuzzi"],
            answer: "Pour toute suite, la climatisation, la piscine, l'accès à la salle de sport, le spa et le jacuzzi sont inclus automatiquement et ne peuvent pas être désélectionnés."
        },
        {
            keywords: ["check-in", "arrivée"],
            answer: "L'arrivée se fait à partir de 14h00. Merci de respecter les horaires pour le confort de tous."
        },
        {
            keywords: ["check-out", "départ"],
            answer: "Le départ doit se faire avant 11h00 pour permettre le nettoyage des chambres."
        },
        {
            keywords: ["préremplissage", "URL", "réservation"],
            answer: "Vous pouvez préremplir votre réservation via l'URL de réservation avec des paramètres simples (arrival, departure, numRooms) ou JSON encodé pour rooms, extrasQty et customer."
        }
    ]
};






// Données par défaut pour l'Hôtel Le Pays

export const defaultFeatures: Feature[] = [
    {
        title: "Restaurant",
        description: "Cuisine locale et internationale pour un séjour délicieux.",
        image: "/assets/images/feature/feature-thumb1.jpg",
        img_bg: "/assets/images/feature/feature-resto.jpg",
    },
    {
        title: "Piscine",
        description: "Détente et loisirs avec piscine extérieure.",
        image: "/assets/images/feature/feature-thumb2.jpg",
        img_bg: "/assets/images/feature/feature-spool.jpg",
    },
    {
        title: "Salle de sport",
        description: "Équipements modernes pour rester en forme.",
        image: "/assets/images/feature/feature-thumb3.jpg",
        img_bg: "/assets/images/feature/feature-sport.jpg",
    },
    {
        title: "Spa & Massage",
        description: "Relaxation et bien-être pour tous les clients.",
        image: "/assets/images/feature/feature-thumb4.jpg",
        img_bg: "/assets/images/feature/feature-spa.jpg",
    },
    {
        title: "Salle de réunion",
        description: "Espaces adaptés pour réunions et conférences.",
        image: "/assets/images/feature/feature-thumb5.jpg",
        img_bg: "/assets/images/feature/feature-conferance.jpg",
    },
    {
        title: "Service de blanchisserie",
        description: "Commodité et confort pour votre séjour.",
        image: "/assets/images/feature/feature-thumb6.jpg",
        img_bg: "/assets/images/feature/feature-clean.jpg",
    },
];


// Données par défaut pour l'Hôtel Le Pays
export  const defaultImages:   GalleryImage[] = [
    "/assets/images/gallery/gallery-thumb1.jpg",
    "/assets/images/gallery/gallery-thumb2.jpg",
    "/assets/images/gallery/gallery-thumb3.jpg",
    "/assets/images/gallery/gallery-thumb4.jpg",
    "/assets/images/gallery/gallery-thumb5.jpg",
    "/assets/images/gallery/gallery-thumb6.jpg",
    "/assets/images/gallery/gallery-thumb7.jpg",
    "/assets/images/gallery/gallery-main-thumb.jpg",
];




// Testimonials
export const testimonials: Testimonial[] = [
    {
        name: "Fergus Douchebag",
        role: "CEO & Co Founder",
        image: "/assets/images/testimonial/testi-img1.png",
        thumb: "/assets/images/testimonial/testi-thumb1.jpg",
        rating: 5,
        text: "Studio thrives on innovation & collaboration delivering bespoke design solutions that transform brands & create lasting impressions.",
        videoUrl: "https://www.youtube.com/embed/WR5Zgrv-qmQ?si=AGF7Q7kv3yjM8rKp",
    },
    {
        name: "Spruce Springclean",
        role: "UI/UX Designer",
        image: "/assets/images/testimonial/testi-img2.png",
        thumb: "/assets/images/testimonial/testi-thumb2.jpg",
        rating: 5,
        text: "Studio thrives on innovation & collaboration delivering bespoke design solutions that transform brands & create lasting impressions.",
        videoUrl: "https://www.youtube.com/embed/WR5Zgrv-qmQ?si=AGF7Q7kv3yjM8rKp",
    },
    {
        name: "Norman Gordon",
        role: "Manager",
        image: "/assets/images/testimonial/testi-img3.png",
        thumb: "/assets/images/testimonial/testi-thumb3.jpg",
        rating: 5,
        text: "Studio thrives on innovation & collaboration delivering bespoke design solutions that transform brands & create lasting impressions.",
        videoUrl: "https://www.youtube.com/embed/WR5Zgrv-qmQ?si=AGF7Q7kv3yjM8rKp",
    },
];




export const instagramFeed: InstagramItem[] = [
    { image: "/assets/images/instragram/instragram-thumb1.jpg", link: "#" },
    { image: "/assets/images/instragram/instragram-thumb2.jpg", link: "#" },
    { image: "/assets/images/instragram/instragram-thumb3.jpg", link: "#" },
    { image: "/assets/images/instragram/instragram-thumb4.jpg", link: "#" },
    { image: "/assets/images/instragram/instragram-thumb5.jpg", link: "#" },
    { image: "/assets/images/instragram/instragram-thumb6.jpg", link: "#" },
];


// footerData.ts
export const footerData = {
    logo: "/assets/images/logo.png",
    description: "Hôtel Le Pays, hôtel 3 étoiles situé à Sendou, confortable et avec un service de qualité.",
    socialLinks: [
        { icon: "fab fa-facebook-f", link: "#" },
        { icon: "fab fa-instagram", link: "#" },
        { icon: "fab fa-linkedin", link: "#" },
        { icon: "fab fa-whatsapp", link: "#" },
    ],
    quickLinks: [
        { title: "Accueil", link: "/" },
        { title: "A propos", link: "/about" },
        { title: "Réservation", link: "/booking" },
        { title: "Mon Profil", link: "/profile" },
        { title: "Tarifs", link: "/pricing" },
        { title: "Menu", link: "/menu" },
        { title: "Contact", link: "/contact" },
    ],
    supportLinks: [
        { title: "Mentions légales", link: "/mentions-legales" },
        { title: "Politique de confidentialité", link: "/politique-confidentialite" },
        { title: "Conditions générales de vente", link: "/conditions-vente" },
        { title: "Conditions générales d’utilisation", link: "/conditions-utilisation" },
        { title: "Politique de cookies", link: "/cookies" },
        { title: "Sécurité et paiement", link: "/securite-paiement" },
    ],
    contact: {
        phone: "+221 33 836 02 76",
        email: "hotellepays@gmail.com",
        address: "Près du centre de santé de Sendou Résidentiel, Bargny, Sénégal",
        whatsapp: "+221 77 698 6382"
    },
    copyright: "© 2025 Hôtel Le Pays. Tous droits réservés.",
    createdBy: "Créé par Pierre Yem Mback",
    createdByTitle: "Créé par Pierre Yem Mback - Développeur Web - Email:yemmbackpierre@gmail.com",
    createdByEmail: "mailto:yemmbackpierre@gmail.com",
};



export const serviceData: Service[] = [
    {
        title: "Hôtel",
        description: "Profitez de nos chambres confortables et d’un service impeccable.",
        iconClass: "flaticon-bed-2",
        image: "/assets/images/resort/service/service-hotel.jpg",
        link: "/hotel",
    },
    {
        title: "Bar",
        description: "Détendez-vous avec nos cocktails et boissons variées dans une ambiance conviviale.",
        iconClass: "flaticon-kitchen",
        image: "/assets/images/resort/service/service-bar.jpg",
        link: "/bar",
    },
    {
        title: "Restaurant",
        description: "Dégustez des plats locaux et internationaux dans notre restaurant accueillant.",
        iconClass: "flaticon-fast-food",
        image: "/assets/images/resort/service/service-resto.jpg",
        link: "/restaurant",
    },
    {
        title: "Piscine et Sport",
        description: "Restez en forme grâce à notre salle de sport entièrement équipée.",
        iconClass: "flaticon-pool",
        image: "/assets/images/resort/service/service-sport.jpg",
        link: "/fitness-centre",
    },
];



export const defaultSeoAboutData: SeoAboutData =  {
    metaTitle:
        "Hôtel Le Pays | Hôtel 3 étoiles à Sendou près de Dakar avec piscine et restaurant",

            metaDescription:
    "Hôtel Le Pays à Sendou au Sénégal : chambres climatisées, piscine, restaurant, bar et salle de réunion. Hôtel idéal près de Rufisque, Bargny, Diamniadio, Yenne Tode, Toubab Dialaw et Dakar.",

        keywords: [
        "hotel sendou senegal",
        "hotel pres de dakar",
        "hotel rufisque",
        "hotel bargny",
        "hotel diamniadio",
        "hotel yenne tode",
        "hotel toubab dialaw",
        "hotel dakar senegal",
        "hotel avec piscine dakar",
        "hotel senegal bord de mer",
        "hotel proche diamniadio",
        "hotel pres aeroport dakar",
        "hotel pour voyage affaires dakar",
    ],

        author: "Hôtel Le Pays",
        robots: "index, follow",

        openGraph: {
        title:
            "Hôtel Le Pays – Hôtel 3 étoiles à Sendou près de Dakar avec piscine",

                description:
        "Séjournez à l’Hôtel Le Pays à Sendou. Chambres modernes, piscine, restaurant et salle de réunion. Idéal pour les séjours à Rufisque, Bargny, Diamniadio, Yenne Tode, Toubab Dialaw et Dakar.",

            url: "https://hotellepays.com",
            type: "website",
            image: "https://hotellepays.com/assets/images/og-hotel-le-pays.jpg",
    },

    twitter: {
        card: "summary_large_image",

            title: "Hôtel Le Pays – Hôtel confortable près de Dakar",

            description:
        "Hôtel 3 étoiles à Sendou avec piscine, restaurant et chambres climatisées. Idéal pour séjours touristiques et professionnels au Sénégal.",

            image: "https://hotellepays.com/assets/images/og-hotel-le-pays.jpg",
    },

    serviceAreas: [
        "Sendou",
        "Rufisque",
        "Bargny",
        "Diamniadio",
        "Yenne Tode",
        "Toubab Dialaw",
        "Dakar",
    ],

        // STRUCTURED DATA POUR GOOGLE
        schema: {
        "@context": "https://schema.org",
            "@type": "Hotel",
            name: "Hôtel Le Pays",
            url: "https://hotellepays.com",
            description:
        "Hôtel 3 étoiles à Sendou près de Dakar avec piscine, restaurant et chambres climatisées.",
            address: {
            "@type": "PostalAddress",
                addressLocality: "Sendou",
                addressRegion: "Dakar",
                addressCountry: "SN",
        },
        areaServed: [
            "Sendou",
            "Rufisque",
            "Bargny",
            "Diamniadio",
            "Yenne Tode",
            "Toubab Dialaw",
            "Dakar",
        ],
            amenities: [
            "Piscine",
            "Restaurant",
            "Bar",
            "Salle de réunion",
            "Salle de sport",
            "Room service",
            "Chambres climatisées",
        ],
    },
}
// Données par défaut pour l'Hôtel Le Pays
export const defaultAboutData : AboutData = {
    title: "Hôtel Le Pays – Hôtel 3 étoiles à Sendou près de Dakar avec piscine",

    description:
        "L’Hôtel Le Pays est un hôtel 3 étoiles situé à Sendou près de Dakar au Sénégal. Profitez de chambres modernes climatisées, d’une piscine, d’un restaurant et d’une salle de réunion. Idéal pour les séjours touristiques et professionnels à Rufisque, Bargny, Diamniadio, Yenne Tode, Toubab Dialaw et Dakar.",

    html_description: `
  <div class="about-long-description">

    <h3 class="blog-details__title">Un hôtel 3 étoiles idéalement situé à Sendou près de Dakar</h3>
    <p class="blog-details__text-2">
      L’Hôtel Le Pays est un hôtel 3 étoiles situé à Sendou au Sénégal,
      à proximité de Dakar, Rufisque, Bargny et Diamniadio.
      Notre établissement accueille aussi bien les voyageurs d’affaires
      que les touristes recherchant un séjour confortable et paisible.
    </p>

    <h3 class="blog-details__title">Chambres modernes et confortables</h3>
    <p class="blog-details__text-2">
      Nos chambres et suites modernes entièrement climatisées sont conçues
      pour garantir un maximum de confort. Chaque chambre offre un espace
      calme et agréable idéal pour se reposer après une journée de travail
      ou de découverte du Sénégal.
    </p>

    <h3 class="blog-details__title">Restaurant et bar convivial</h3>
    <p class="blog-details__text-2">
      Le restaurant de l’hôtel propose une cuisine locale sénégalaise
      ainsi que des plats internationaux. Notre bar convivial est l’endroit
      parfait pour se détendre et profiter d’un moment agréable entre amis
      ou collègues.
    </p>

    <h3 class="blog-details__title">Piscine et espaces de détente</h3>
    <p class="blog-details__text-2">
      Profitez de notre piscine extérieure pour vous relaxer sous le soleil
      du Sénégal. L’hôtel dispose également d’une salle de sport pour les
      clients souhaitant rester actifs pendant leur séjour.
    </p>

    <h3 class="blog-details__title">Idéal pour les voyages d’affaires et les vacances</h3>
    <p class="blog-details__text-2">
      Grâce à sa salle de réunion et à ses services professionnels,
      l’Hôtel Le Pays est parfaitement adapté pour les séminaires,
      réunions et événements professionnels dans la région de
      Diamniadio, Rufisque et Dakar.
    </p>

    <h3 class="blog-details__title">Un emplacement stratégique au Sénégal</h3>
    <p class="blog-details__text-2">
      Situé à Sendou, notre hôtel est proche de plusieurs villes importantes
      comme Rufisque, Bargny, Diamniadio, Yenne Tode, Toubab Dialaw et Dakar,
      ce qui en fait un point de séjour idéal pour les voyageurs visitant
      la région.
    </p>

  </div>
`,
    html_description_image: "/assets/images/about/about-hotel.jpg",

    features: [
        "Hôtel 3 étoiles à Sendou près de Dakar",
        "Chambres et suites modernes climatisées",
        "Restaurant cuisine sénégalaise et internationale",
        "Bar convivial pour se détendre",
        "Piscine extérieure",
        "Salle de sport équipée",
        "Salle de réunion pour séminaires et événements",
        "Room service disponible",
    ],

    images: [
        "/assets/images/about/about-thumb1.jpg",
        "/assets/images/about/about-thumb2.jpg",
        "/assets/images/about/about-thumb3.jpg",
    ],

    buttonText: "Découvrir l'hôtel",
    buttonLink: "about",

    seo: defaultSeoAboutData,
};

export  type BookingData = {
    checkIn: string;
    checkOut: string;
    rooms: string;
};

export  type HotelData = {
    name?: string;
    stars?: number;
    location?: string;
    description?: string;
};



// Données par défaut
export  const defaultHotelData: Required<HotelData> = {
    name: "Hôtel Le Pays",
    stars: 3,
    location: "Sendou, Sénégal",
    description:
        "Hôtel 3 étoiles situé à Sendou, confortable et offrant un service de qualité pour un séjour agréable sans dépaysement.",
};





export const defaultDestinations: ExploreItem[] = [
    {
        name: "Réserve de Bandia",
        slug: "reserve-de-bandia-senegal",
        title: "Safari à la Réserve de Bandia",
        subtitle: "Safari africain proche de Dakar",
        type: "Nature & Safari",
        location: "Bandia, Sénégal",
        size: "3 500 ha",
        description:
            "Située à environ 65 km de Dakar, la Réserve de Bandia est un site incontournable pour découvrir la faune africaine dans son habitat naturel, accompagné de guides professionnels.",
        rating: 4.8,
        reviews: 1246,
        tag: "Incontournable",
        price: "0",
        default_curency: {
            code: "XOF",
            name: "Franc CFA",
            symbol: "FCFA",
            rateToEUR: 655.957,
        },
        features: ["Safari", "Animaux sauvages", "Photographie"],
        basicInfo: [
            { icon: "fa-map-marker-alt", text: "Bandia, Sénégal" },
            { icon: "fa-binoculars", text: "Safari guidé" },
            { icon: "fa-car", text: "Véhicule ouvert" },
        ],
        details: [
            { label: "Type", value: "Réserve naturelle" },
            { label: "Superficie", value: "3 500 hectares" },
            { label: "Idéal pour", value: "Familles & groupes" },
        ],
        facilities: [
            { icon: "fa-parking", name: "Parking" },
            { icon: "fa-utensils", name: "Aire de pique-nique" },
            { icon: "fa-wifi", name: "Wi-Fi" },
        ],
        images: [
            "/assets/images/blog/reserve-bandia1.jpg",
            "/assets/images/blog/reserve-bandia1.jpg",
            "/assets/images/blog/reserve-bandia1.jpg",
        ],
        image: "/assets/images/blog/reserve-bandia1.jpg",
        link: "/blog-details/reserve-de-bandia-senegal",
        options: [
            {
                name: "Visite guidée",
                price: "10000",
                description: "Guide professionnel pour une immersion complète.",
            },
            {
                name: "Safari privé",
                price: "15000",
                description: "Véhicule privé pour une expérience exclusive.",
            },
        ],
    },

    {
        name: "Village des Tortues",
        slug: "village-des-tortues-senegal",
        title: "Village des Tortues de Sangalkam",
        subtitle: "Centre de conservation et d’éducation",
        type: "Nature & Éducation",
        location: "Sangalkam, Sénégal",
        size: "5 ha",
        description:
            "Centre dédié à la protection et à la reproduction des tortues. Une destination idéale pour les familles et les sorties pédagogiques.",
        rating: 4.5,
        reviews: 642,
        tag: "Famille",
        price: "0",
        default_curency: {
            code: "XOF",
            name: "Franc CFA",
            symbol: "FCFA",
            rateToEUR: 655.957,
        },
        features: ["Tortues", "Éducation", "Nature"],
        basicInfo: [
            { icon: "fa-map-marker-alt", text: "Sangalkam, Sénégal" },
            { icon: "fa-turtle", text: "Protection animale" },
            { icon: "fa-tree", text: "Balade ombragée" },
        ],
        details: [
            { label: "Type", value: "Centre de conservation" },
            { label: "Public", value: "Familles & enfants" },
        ],
        facilities: [
            { icon: "fa-parking", name: "Parking" },
            { icon: "fa-utensils", name: "Pique-nique" },
        ],
        images: [
            "/assets/images/blog/village-tortues1.jpg",
            "/assets/images/blog/village-tortues1.jpg",
            "/assets/images/blog/village-tortues1.jpg",
        ],
        image: "/assets/images/blog/village-tortues1.jpg",
        link: "/blog-details/village-des-tortues-senegal",
        options: [
            {
                name: "Visite guidée",
                price: "3000",
                description: "Découverte du site avec un guide.",
            },
        ],
    },

    {
        name: "Lac Rose",
        slug: "lac-rose-senegal",
        title: "Lac Rose (Retba)",
        subtitle: "Un phénomène naturel unique",
        type: "Nature & Culture",
        location: "Dakar, Sénégal",
        size: "3 km²",
        description:
            "Célèbre pour sa couleur rose et la récolte du sel, le Lac Retba est un site emblématique du Sénégal.",
        rating: 4.6,
        reviews: 987,
        tag: "Populaire",
        price: "0",
        default_curency: {
            code: "XOF",
            name: "Franc CFA",
            symbol: "FCFA",
            rateToEUR: 655.957,
        },
        features: ["Pirogue", "Sel", "Photographie"],
        basicInfo: [
            { icon: "fa-water", text: "Balade en pirogue" },
            { icon: "fa-salt", text: "Récolte du sel" },
        ],
        details: [
            { label: "Type", value: "Lac naturel" },
            { label: "Particularité", value: "Couleur rose unique" },
        ],
        facilities: [
            { icon: "fa-parking", name: "Parking" },
            { icon: "fa-utensils", name: "Restauration locale" },
        ],
        images: [
            "/assets/images/blog/lac-rose2.jpg",
            "/assets/images/blog/lac-rose3.jpg",
        ],
        image: "/assets/images/blog/lac-rose2.jpg",
        link: "/blog-details/lac-rose-senegal",
    },
];

export const defaultTraditionalFoods: ExploreItem[] = [
    {
        name: "Thiep bou dienne",
        slug: "thieboudienne",
        title: "Thiep bou dienne",
        subtitle: "Plat national sénégalais",
        type: "Cuisine traditionnelle",
        location: "Sénégal",
        size: "Plat individuel",
        description:
            "Riz au poisson accompagné de légumes, symbole de la gastronomie sénégalaise.",
        rating: 4.9,
        reviews: 2150,
        tag: "Incontournable",
        price: "3000",
        default_curency: {
            code: "XOF",
            name: "Franc CFA",
            symbol: "FCFA",
            rateToEUR: 655.957,
        },
        features: ["Riz", "Poisson", "Légumes"],
        basicInfo: [
            { icon: "fa-utensils", text: "Plat principal" },
            { icon: "fa-pepper-hot", text: "Épicé modéré" },
        ],
        details: [
            { label: "Origine", value: "Sénégal" },
        ],
        facilities: [],
        images: ["/assets/images/foods/thieboudienne.jpg"],
        image: "/assets/images/foods/thieboudienne.jpg",
        link: "/plats/thieboudienne",
    },

    {
        name: "Yassa Poulet",
        slug: "yassa-poulet",
        title: "Yassa au Poulet",
        subtitle: "Poulet mariné aux oignons et citron",
        type: "Cuisine traditionnelle",
        location: "Casamance, Sénégal",
        size: "Plat individuel",
        description:
            "Poulet mariné au citron et moutarde, servi avec une sauce aux oignons.",
        rating: 4.7,
        reviews: 1680,
        tag: "Populaire",
        price: "2500",
        default_curency: {
            code: "XOF",
            name: "Franc CFA",
            symbol: "FCFA",
            rateToEUR: 655.957,
        },
        features: ["Poulet", "Oignons", "Citron"],
        basicInfo: [
            { icon: "fa-drumstick-bite", text: "Poulet" },
        ],
        details: [
            { label: "Origine", value: "Casamance" },
        ],
        facilities: [],
        images: ["/assets/images/foods/yassa.jpg"],
        image: "/assets/images/foods/yassa.jpg",
        link: "/plats/yassa-poulet",
    },

    {
        name: "Mafé",
        slug: "mafe",
        title: "Mafé",
        subtitle: "Sauce à base d’arachide",
        type: "Cuisine traditionnelle",
        location: "Afrique de l’Ouest",
        size: "Plat individuel",
        description:
            "Sauce onctueuse à l’arachide accompagnée de viande et de riz.",
        rating: 4.6,
        reviews: 1340,
        price: "2500",
        default_curency: {
            code: "XOF",
            name: "Franc CFA",
            symbol: "FCFA",
            rateToEUR: 655.957,
        },
        features: ["Arachide", "Viande", "Riz"],
        basicInfo: [
            { icon: "fa-bowl-food", text: "Sauce arachide" },
        ],
        details: [],
        facilities: [],
        images: ["/assets/images/foods/mafe.jpg"],
        image: "/assets/images/foods/mafe.jpg",
        link: "/plats/mafe",
    }
];

// Données par défaut
export  const defaultExplore: ExploreItem[] =  defaultDestinations;



export const FAQData: FAQ[] = [
    {
        question: "Quels services propose l'Hôtel Le Pays ?",
        answer: "Nous proposons un hébergement confortable, un restaurant avec plats locaux et internationaux, une piscine, une salle de sport, et un service de blanchisserie de qualité.",
    },
    {
        question: "Comment puis-je réserver une chambre ?",
        answer: "Vous pouvez réserver directement sur notre site internet, par téléphone ou via les plateformes de réservation en ligne.",
    },
    {
        question: "Quels sont les modes de paiement acceptés ?",
        answer: "Nous acceptons les paiements par carte bancaire, mobile money, et espèces à la réception.",
    },
    {
        question: "L'hôtel dispose-t-il d'une piscine et d'une salle de sport ?",
        answer: "Oui, l'Hôtel Le Pays dispose d'une piscine pour adultes et enfants ainsi qu'une salle de fitness entièrement équipée pour rester en forme.",
    },
    {
        question: "L'hôtel propose-t-il un service de blanchisserie ?",
        answer: "Oui, nous proposons un service de blanchisserie rapide et fiable pour le confort de nos clients.",
    },
];



export const Pricings: Pricing[] = [
    {
        title: "Chambre Journée",
        price: 20000,
        currency: "Fr",
        name: "simple-room",
        per: "par nuit",
        features: [
            "Service de navette aller-retour",
            "Piscine",
            "Guide pour visite de la ville",
            "Internet fibre",
            "Réservation de vols en ligne",
            "Réservation de chambres"
        ],
        link: "/booking/chambre-journee",
    },
    {
        title: "Chambre Nuitée",
        price: 25000,
        currency: "Fr",
        per: "par nuit",
        name: "double-room",
        features: [
            "Service de navette aller-retour",
            "Piscine",
            "Guide pour visite de la ville",
            "Internet fibre",
            "Réservation de vols en ligne",
            "Réservation de chambres"
        ],
        link: "/booking/chambre-nuitee",
    },
    {
        title: "Suite",
        price: 60000,
        currency: "Fr",
        per: "par nuit",
        name: "suite",
        features: [
            "Service de navette aller-retour",
            "Piscine",
            "Guide pour visite de la ville",
            "Internet fibre",
            "Réservation de vols en ligne",
            "Réservation de chambres"
        ],
        link: "/booking/suite",
    },
];


export const ExtrasExtra: Extra[] = [
    { name: "Blanchisserie", price: 10 },
    { name: "Location de voiture", price: 10 },
    { name: "Petit-déjeuner", price: 10 },
    { name: "Déjeuner", price: 15 },
    { name: "Dîner", price: 20 },
    { name: "Pack repas complet", price: 50 },
    { name: "Wifi", price: 10 },
    { name: "Salle de sport", price: 10 },
    { name: "Piscine", price: 10 },
];

export const ExtrasExtraData: Extra[] = [
    { name: "Blanchisserie", price: 10 },
    { name: "Petit-déjeuner", price: 10 },
    { name: "Déjeuner", price: 15 },
    { name: "Dîner", price: 20 },
    { name: "Pack repas complet", price: 50 },
    { name: "Salle de sport", price: 10 },
    { name: "Piscine", price: 10 },
];

// Réexporter sous le nom `extras` pour être utilisé dans les composants (ex: RoomDetails.tsx)
export const extras = ExtrasExtraData;


// Données dynamiques pour le slider
export const slidesData: Slide[] = [
    {
        background: "images/banner/pays-bg1.jpg",
        title: "Hôtel Le Pays – Confort et Sérénité",
        description:
            "Hôtel 3 étoiles situé à Sendou, un établissement confortable pour ne pas être dépaysé, offrant un service de qualité.",
        buttonText: "Découvrez nos chambres",
        buttonLink: "/rooms",
        videoLink: "https://www.youtube.com/embed/WR5Zgrv-qmQ?si=AGF7Q7kv3yjM8rKp",
        stars: 3,
    },
    {
        background: "images/banner/pays-bg2.jpg",
        title: "Séjour Relaxant au Pays",
        description:
            "Profitez d'une expérience unique mêlant détente et confort au cœur de Sendou, avec toutes les commodités dont vous avez besoin.",
        buttonText: "Réservez maintenant",
        buttonLink: "/booking",
        videoLink: "https://www.youtube.com/embed/WR5Zgrv-qmQ?si=AGF7Q7kv3yjM8rKp",
        stars: 3,
    },
    {
        background: "images/banner/pays-bg3.jpg",
        title: "Qualité et Service Exceptionnel",
        description:
            "Notre équipe est dédiée à rendre votre séjour agréable et inoubliable, avec un service attentionné et personnalisé.",
        buttonText: "En savoir plus",
        buttonLink: "/about",
        videoLink: "https://www.youtube.com/embed/WR5Zgrv-qmQ?si=AGF7Q7kv3yjM8rKp",
        stars: 3,
    },
];
export const sliderData = [
    {
        title: "Bienvenue à l'Hôtel Le Pays",
        description: "Profitez d’un séjour confortable et chaleureux à Sendou, avec un service de qualité et une expérience unique, fort de 20 ans d’expertise dans l’hôtellerie.",
        image: "/assets/images/banner/banner-bg1.webp",
        buttonText: "Reserver une chambre",
        buttonLink: "/booking",
        videoLink: "https://youtu.be/WR5Zgrv-qmQ?si=AGF7Q7kv3yjM8rKp"
    },
    {
        title: "Confort et Qualité",
        description: "Notre objectif est de vous faire sentir comme chez vous, avec des prestations soignées, adaptées à vos besoins, pour un séjour agréable et mémorable.",
        image: "/assets/images/banner/banner-bg2.webp",
        buttonText: "Reserver maintenant",
        buttonLink: "/booking",
        videoLink: "https://www.youtube.com/embed/WR5Zgrv-qmQ?si=AGF7Q7kv3yjM8rKp"
    },
    {
        title: "Expérience Unique à Sendou",
        description: "Que ce soit pour un séjour d’affaires ou de loisirs, notre équipe est à votre service pour rendre votre visite inoubliable, avec confort et hospitalité.",
        image: "/assets/images/banner/banner-bg3.webp",
        buttonText: "Découvrir Nos Chambres",
        buttonLink: "/rooms-suites",
        videoLink: "https://www.youtube.com/embed/WR5Zgrv-qmQ?si=AGF7Q7kv3yjM8rKp"
    }
];



// Valeurs par défaut pour l'Hôtel Le Pays
export const defaultHeroData: Required<HeroData> = {
    type: "slider",
    images: ["/assets/images/about/about-thumb1.jpg"],
    videoUrl: "",
    title: "Bienvenue à l'Hôtel Le Pays",
    subtitle: "Hôtel 3 étoiles situé à Sendou, confortable et offrant un service de qualité.",
    buttonText: "Découvrir",
    buttonLink: "/page-about.html",
};





// Données par défaut pour l'Hôtel Le Pays
export const defaultImageBannerData: ImageBanner[] = [
    {
        bgImage: "/assets/images/resort/banner/banner-island-bg1.jpg",
        image: "/assets/images/resource/banner-video1-1.jpg",
        videoUrl: "https://www.youtube.com/embed/WR5Zgrv-qmQ?si=AGF7Q7kv3yjM8rKp",
        text: "Hôtel Le Pays à Sendou, un établissement confortable offrant luxe et détente.",
        buttonText: "Learn More",
        buttonLink: "/page-service.html",
    },
];


export const defaultBannerVideoData: Required<BannerVideoData> = {
    titleLines: ["Unlock Your", "Best Stays."],
    highlight: "Royle",
    buttonText: "Hotel Booking",
    buttonLink: "/hotel-details.html",
    videoSrc: "/assets/images/mountain/video-moutain-layout.mp4",
    videoPoster: "/assets/images/mountain/video-poster.jpg",
    description:
        "From logo design to digital experiences, we help brands stand out in a crowded world. Our design studio thrives on fresh ideas, clean aesthetics, and purposeful design.",
    scrollText: "[ SCROLL ]",
};





export const BASE_PRICE = 299;


export const defaultContactInfos: ContactInfoItem[] =  [

    {
        type: "phone",
        icon: "fa-phone",
        title: "Appelez-nous",
        value: "+221 77 698 63 82",
        number: "221776986382",// sans +
        link: "tel:+221776986382",
    },
    {
        type: "whatsapp",
        title: "WhatsApp",
        icon: "fa fa-whatsapp",
        value: "+221 77 698 63 82",
        number: "221776986382",// sans +
        link: "https://wa.me/221776986382",
    },
    {
        type: "email",
        title: "Email",
        icon: "fa-envelope",
        value: "hotellepays@gmail.com",
        number: "",
        link: "mailto:hotellepays@gmail.com",
    },
    {
        type: "hours",
        title: "Horaires",
        value: "Mon - Sat: 8:00 AM - 6:30 PM | Sunday: Closed",
        number: "",
        link: "+33612345678",
    },
    {
        type: "location",
        icon: "fa-location-dot",
        title: "Visit anytime",
        value: "Sendou, Sénégal",
        // Stocker les coordonnées demandées (latitude,longitude) — ex: 48.858370,2.294481
        number: "48.858370,2.294481",
        // Fournir un lien directions Google Maps (optionnel: le composant peut aussi construire l'URL à partir des coordonnées)
        link: "https://www.google.com/maps/dir/?api=1&destination=48.858370,2.294481",
    },
];


export const defaultheaderData: HeaderDataItem =  {
    logo: "/assets/images/logo.png",
    logoSticky: "/assets/images/logo-2.png",
    logoMobile: "/assets/images/logo.png",

    menu: [
        { title: "Accueil", link: "/" },
        { title: "Chambres & Suites", link: "/rooms-suites" },
        { title: "Nos tarif", link: "/pricing" },
        {
            title: "Services",
            link: "#",
            subMenu: [
                { title: "Nos services", link: "/services" },
                { title: "Notre menu", link: "/menu" },
                { title: "Foire aux questions", link: "/faq" },
            ],
        },
        { title: "Contact", link: "/contact" },
        { title: "Mon Profil", link: "/profile" },
    ],

    button: {
        text: "Réserver",
        link: "/booking",
        arrowIcon: "/assets/images/icons/button-arrow.svg",
    },

    contactInfo: defaultContactInfos,
    socialLinks: [
        {
            icon: "fab fa-twitter",
            link: "https://twitter.com/tonprofil"
        },
        {
            icon: "fab fa-facebook-f",
            link: "https://facebook.com/tonprofil"
        },
        {
            icon: "fab fa-pinterest",
            link: "https://pinterest.com/tonprofil"
        },
        {
            icon: "fab fa-instagram",
            link: "https://instagram.com/tonprofil"
        }
    ],
};



export const defaultContactData: ContactData = {
    sectionTitle: "Get in touch with us",
    sectionSubtitle: "Need any help?",
    description:
        "Hôtel Le Pays est à votre écoute pour toute question ou demande. N'hésitez pas à nous écrire ou nous appeler.",
    formAction: "#", // ou URL backend si tu as un formulaire réel
    contactItems: defaultContactInfos,
    mapSrc:
        "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d759.164156710888!2d-17.199490508953147!3d14.670524682880869!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTTCsDQwJzE0LjAiTiAxN8KwMTEnNTQuMCJX!5e1!3m2!1sfr!2ssn!4v1766823710745!5m2!1sfr!2ssn",
};




// Exemple d'objets adaptés pour defaultRooms
export const defaultRooms: Room[] = [
    {
        name: "Chambre Standard",
        slug: "chambre-standard",
        title: "Chambre Standard",
        subtitle: "Chambre confortable pour 2 personnes",
        type: "Standard",
        guests: 2,
        size: "25 m²",
        price: "20000",
        default_curency: {
            code: "XOF",
            name: "Franc CFA",
            symbol: "FCFA",
            rateToEUR: 655.957
        },
        description: "Une chambre simple et confortable idéale pour les courts séjours.",
        basicInfo: [
            { icon: "fa-user-friends", text: "2 personnes" },
            { icon: "fa-bed", text: "1 lit double" },
            { icon: "fa-bath", text: "1 salle de bain" },
            { icon: "fa-fan", text: "Climatisation optionnelle" }
        ],
        details: [
            { label: "Superficie", value: "25 m²" },
            { label: "Lits", value: "1 lit double" },
            { label: "Capacité", value: "2 personnes" },
            { label: "Salle de bain", value: "1" },
        ],
        facilities: [
            { icon: "fa-wifi", name: "Wi-Fi" },
            { icon: "fa-tv", name: "TV" },
            { icon: "fa-fan", name: "Climatisation" },
        ],
        images: [
            "/assets/images/rooms/room-standard.jpg",
            "/assets/images/rooms/room-standard2.jpg",
            "/assets/images/rooms/room-standard3.jpg"
        ],
        image: "/assets/images/rooms/room-standard.jpg",
        link: "/room-details/chambre-standard",
    },
    {
        name: "Chambre de Luxe",
        slug: "chambre-luxe",
        title: "Chambre de Luxe",
        subtitle: "Chambre spacieuse avec balcon et minibar",
        type: "Deluxe",
        guests: 2,
        size: "35 m²",
        price: "25000",
        default_curency: {
            code: "XOF",
            name: "Franc CFA",
            symbol: "FCFA",
            rateToEUR: 655.957
        },
        description: "Profitez d'une chambre élégante avec balcon, minibar et climatisation optionnelle.",
        basicInfo: [
            { icon: "fa-user-friends", text: "2 personnes" },
            { icon: "fa-bed", text: "1 lit king size" },
            { icon: "fa-bath", text: "1 salle de bain" },
            { icon: "fa-fan", text: "Climatisation optionnelle" },
            { icon: "fa-wine-bottle", text: "Minibar" },
            { icon: "fa-door-open", text: "Balcon" },
        ],
        details: [
            { label: "Superficie", value: "35 m²" },
            { label: "Lits", value: "1 lit king size" },
            { label: "Capacité", value: "2 personnes" },
            { label: "Balcon", value: "Oui" },
            { label: "Salle de bain", value: "1" },
        ],
        facilities: [
            { icon: "fa-wifi", name: "Wi-Fi" },
            { icon: "fa-tv", name: "Smart TV" },
            { icon: "fa-fan", name: "Climatisation" },
            { icon: "fa-wine-bottle", name: "Minibar" },
        ],
        images: [
            "/assets/images/rooms/room-deluxe.jpg",
            "/assets/images/rooms/room-deluxe2.jpg",
            "/assets/images/rooms/room-deluxe3.jpg"
        ],
        image: "/assets/images/rooms/room-deluxe.jpg",
        link: "/room-details/chambre-luxe",
    },
    {
        name: "Chambre Double",
        slug: "chambre-double",
        title: "Chambre Double",
        subtitle: "Idéale pour 4 personnes avec 2 lits",
        type: "Double",
        guests: 4,
        size: "40 m²",
        price: "25000",
        default_curency: {
            code: "XOF",
            name: "Franc CFA",
            symbol: "FCFA",
            rateToEUR: 655.957
        },
        description: "Une chambre spacieuse avec deux lits pour accueillir confortablement 4 personnes.",
        basicInfo: [
            { icon: "fa-user-friends", text: "4 personnes" },
            { icon: "fa-bed", text: "2 lits doubles" },
            { icon: "fa-bath", text: "1 salle de bain" },
            { icon: "fa-fan", text: "Climatisation" },
        ],
        details: [
            { label: "Superficie", value: "40 m²" },
            { label: "Lits", value: "2 lits doubles" },
            { label: "Capacité", value: "4 personnes" },
            { label: "Salle de bain", value: "1" },
        ],
        facilities: [
            { icon: "fa-wifi", name: "Wi-Fi" },
            { icon: "fa-tv", name: "TV" },
            { icon: "fa-fan", name: "Climatisation" },
        ],
        images: [
            "/assets/images/rooms/room-double.jpg",
            "/assets/images/rooms/room-double2.jpg",
            "/assets/images/rooms/room-double3.jpg"
        ],
        image: "/assets/images/rooms/room-double.jpg",
        link: "/room-details/chambre-double",
    },
    {
        name: "Chambre Familiale",
        slug: "chambre-familiale",
        title: "Chambre Familiale",
        subtitle: "Pour 2 adultes et 3 enfants, avec 2 lits",
        type: "Familiale",
        guests: 5,
        size: "50 m²",
        price: "25000",
        default_curency: {
            code: "XOF",
            name: "Franc CFA",
            symbol: "FCFA",
            rateToEUR: 655.957
        },
        description: "Chambre idéale pour les familles avec 2 adultes et 3 enfants, deux lits spacieux et climatisation optionnelle.",
        basicInfo: [
            { icon: "fa-user-friends", text: "2 adultes + 3 enfants" },
            { icon: "fa-bed", text: "2 lits doubles" },
            { icon: "fa-bath", text: "1 salle de bain" },
            { icon: "fa-fan", text: "Climatisation" },
        ],
        details: [
            { label: "Superficie", value: "50 m²" },
            { label: "Lits", value: "2 lits doubles" },
            { label: "Capacité", value: "5 personnes" },
            { label: "Salle de bain", value: "1" },
        ],
        facilities: [
            { icon: "fa-wifi", name: "Wi-Fi" },
            { icon: "fa-tv", name: "TV" },
            { icon: "fa-fan", name: "Climatisation" },
        ],
        images: ["/assets/images/rooms/room-familiale.jpg"],
        image: "/assets/images/rooms/room-familiale.jpg",
        link: "/room-details/chambre-familiale",
    },
];
export const defaultPresentationRoms: Room[] = [
    {
        name: "Chambre Deluxe",
        slug: "chambre-deluxe",
        title: "Chambre Deluxe",
        subtitle: "Chambre confortable avec balcon",
        type: "Deluxe",
        guests: 2,
        size: "30 m²",
        price: "25000",
        default_curency: {
            code: "XOF",
            name: "Franc CFA",
            symbol: "FCFA",
            rateToEUR: 655.957
        },
        description: "Une chambre élégante et confortable idéale pour un séjour relaxant, équipée d’un balcon et d’un minibar.",
        basicInfo: [
            { icon: "fa-user-friends", text: "2 personnes" },
            { icon: "fa-bed", text: "1 lit double" },
            { icon: "fa-bath", text: "1 salle de bain" },
            { icon: "fa-fan", text: "Climatisation" },
            { icon: "fa-wine-bottle", text: "Minibar" },
            { icon: "fa-door-open", text: "Balcon" },
        ],
        details: [
            { label: "Superficie", value: "30 m²" },
            { label: "Lits", value: "1 lit double" },
            { label: "Capacité", value: "2 personnes" },
            { label: "Balcon", value: "Oui" },
            { label: "Salle de bain", value: "1" },
        ],
        facilities: [
            { icon: "fa-wifi", name: "Wi-Fi" },
            { icon: "fa-tv", name: "Smart TV" },
            { icon: "fa-fan", name: "Climatisation" },
            { icon: "fa-wine-bottle", name: "Minibar" },
        ],
        images: ["/assets/images/rooms/room-deluxe.jpg"],
        image: "/assets/images/rooms/room-deluxe.jpg",
        link: "/room-details/chambre-deluxe",
    },
    {
        name: "Chambre Familiale",
        slug: "chambre-familiale",
        title: "Chambre Familiale",
        subtitle: "Idéale pour les séjours en famille",
        type: "Familiale",
        guests: 4,
        size: "42 m²",
        price: "35000",
        default_curency: {
            code: "XOF",
            name: "Franc CFA",
            symbol: "FCFA",
            rateToEUR: 655.957
        },
        description: "Une chambre spacieuse conçue pour les familles, avec deux lits et tout le confort nécessaire.",
        basicInfo: [
            { icon: "fa-user-friends", text: "4 personnes" },
            { icon: "fa-bed", text: "2 lits doubles" },
            { icon: "fa-bath", text: "1 salle de bain" },
            { icon: "fa-fan", text: "Climatisation" },
        ],
        details: [
            { label: "Superficie", value: "42 m²" },
            { label: "Lits", value: "2 lits doubles" },
            { label: "Capacité", value: "4 personnes" },
            { label: "Salle de bain", value: "1" },
        ],
        facilities: [
            { icon: "fa-wifi", name: "Wi-Fi" },
            { icon: "fa-tv", name: "TV" },
            { icon: "fa-fan", name: "Climatisation" },
        ],
        images: ["/assets/images/rooms/room-familiale.jpg"],
        image: "/assets/images/rooms/room-familiale.jpg",
        link: "/room-details/chambre-familiale",
    },
    {
        name: "Suite",
        slug: "suite",
        title: "Suite",
        subtitle: "Suite spacieuse avec salon, terrasse et jacuzzi",
        type: "Suite",
        guests: 3,
        size: "55 m²",
        price: "60000",
        default_curency: {
            code: "XOF",
            name: "Franc CFA",
            symbol: "FCFA",
            rateToEUR: 655.957
        },
        description: "Une suite spacieuse et élégante avec salon, terrasse et jacuzzi pour un séjour premium.",
        basicInfo: [
            { icon: "fa-user-friends", text: "3 personnes" },
            { icon: "fa-bed", text: "1 lit king size + canapé" },
            { icon: "fa-bath", text: "1 salle de bain" },
            { icon: "fa-hot-tub", text: "Jacuzzi" },
            { icon: "fa-credit-card", text: "Accès par carte" },
            { icon: "fa-umbrella-beach", text: "Terrasse" },
        ],
        details: [
            { label: "Superficie", value: "55 m²" },
            { label: "Lits", value: "1 lit king size + canapé" },
            { label: "Capacité", value: "3 personnes" },
            { label: "Salle de bain", value: "1" },
            { label: "Terrasse", value: "Oui" },
            { label: "Jacuzzi", value: "Oui" },
        ],
        facilities: [
            { icon: "fa-wifi", name: "Wi-Fi" },
            { icon: "fa-tv", name: "Smart TV" },
            { icon: "fa-concierge-bell", name: "Room service" },
            { icon: "fa-credit-card", name: "Accès par carte" },
            { icon: "fa-umbrella-beach", name: "Terrasse privée" },
            { icon: "fa-hot-tub", name: "Jacuzzi" },
        ],
        image: "/assets/images/rooms/suites/suite-107.jpg",
        images: ["/assets/images/rooms/suites/suite-107.jpg"],
        link: "/room-details/suite",
    },
];
export const defaultSuites: Room[] = [
    {
        name: "Suite Confort",
        slug: "suite-confort",
        title: "Suite Confort",
        subtitle: "TV LED 43 pouces / Mini bar / Non-fumeur / Recharge USB",
        type: "Suite",
        guests: 3,
        size: "60 m²",
        price: "60000",
        default_curency: {
            code: "XOF",
            name: "Franc CFA",
            symbol: "FCFA",
            rateToEUR: 655.957
        },
        description: "Profitez d'un séjour confortable dans une suite bien équipée pour toute la famille.",
        basicInfo: [
            { icon: "fa-user-friends", text: "2 adultes + 1 enfant" },
            { icon: "fa-bed", text: "1 lit pour 4 personnes" },
            { icon: "fa-bath", text: "1 salle de bain avec Jacuzzi" },
            { icon: "fa-credit-card", text: "Porte à carte" },
            { icon: "fa-umbrella-beach", text: "Terrasse" },
        ],
        details: [
            { label: "Superficie", value: "60 m²" },
            { label: "Lits", value: "1 lit pour 4 personnes" },
            { label: "Capacité", value: "3 personnes" },
            { label: "Vue", value: "Paysage" },
            { label: "Porte", value: "Serrure intelligente" },
            { label: "Terrasse", value: "Oui" },
            { label: "Jacuzzi", value: "Oui" },
        ],
        facilities: [
            { icon: "fa-wifi", name: "Wi-Fi" },
            { icon: "fa-tv", name: "TV intelligente" },
            { icon: "fa-concierge-bell", name: "Service en chambre" },
            { icon: "fa-swimming-pool", name: "Piscine privée" },
            { icon: "fa-dumbbell", name: "Salle de sport" },
            { icon: "fa-hot-tub", name: "Jacuzzi" },
            { icon: "fa-credit-card", name: "Porte à carte" },
            { icon: "fa-umbrella-beach", name: "Terrasse privée" },
        ],
        image: "/assets/images/rooms/suites/suite-107.jpg",
        images: [
            "/assets/images/rooms/suites/suite-107.jpg",
            "/assets/images/rooms/suites/suite-107-2.jpg",
            "/assets/images/rooms/suites/suite-107-3.jpg",
        ],
        link: "/room-details/suite-confort",
    },
    {
        name: "Suite Vip",
        slug: "suite-vip",
        title: "Suite Vip",
        subtitle: "Spacieuse et pratique pour un séjour agréable",
        type: "Suite",
        guests: 3,
        size: "60 m²",
        price: "60000",
        default_curency: {
            code: "XOF",
            name: "Franc CFA",
            symbol: "FCFA",
            rateToEUR: 655.957
        },
        description: "Une suite simple et confortable, idéale pour un séjour en famille ou entre amis.",
        basicInfo: [
            { icon: "fa-user-friends", text: "2 adultes + 1 enfant" },
            { icon: "fa-bed", text: "1 lit pour 4 personnes" },
            { icon: "fa-bath", text: "1 salle de bain avec Jacuzzi" },
            { icon: "fa-credit-card", text: "Porte à carte" },
            { icon: "fa-umbrella-beach", text: "Terrasse" },
        ],
        details: [
            { label: "Superficie", value: "60 m²" },
            { label: "Lits", value: "1 lit pour 4 personnes" },
            { label: "Capacité", value: "3 personnes" },
            { label: "Vue", value: "Ville" },
            { label: "Porte", value: "Serrure intelligente" },
            { label: "Terrasse", value: "Oui" },
            { label: "Jacuzzi", value: "Oui" },
        ],
        facilities: [
            { icon: "fa-wifi", name: "Wi-Fi" },
            { icon: "fa-tv", name: "TV intelligente" },
            { icon: "fa-concierge-bell", name: "Service en chambre" },
            { icon: "fa-hot-tub", name: "Jacuzzi" },
            { icon: "fa-credit-card", name: "Porte à carte" },
            { icon: "fa-umbrella-beach", name: "Terrasse privée" },
        ],
        image: "/assets/images/rooms/suites/suite-207-2.jpg",
        images: [
            "/assets/images/rooms/suites/suite-207.jpg",
            "/assets/images/rooms/suites/suite-207-2.jpg",
            "/assets/images/rooms/suites/suite-207-3.jpg",
        ],
        link: "/room-details/suite-vip",
    },
    {
        name: "Suite Deluxe",
        slug: "suite-delux",
        title: "Suite Deluxe",
        subtitle: "Idéale pour les familles ou petits groupes",
        type: "Suite",
        guests: 3,
        size: "60 m²",
        price: "60000",
        default_curency: {
            code: "XOF",
            name: "Franc CFA",
            symbol: "FCFA",
            rateToEUR: 655.957
        },
        description: "Une suite spacieuse pour toute la famille avec tous les équipements nécessaires.",
        basicInfo: [
            { icon: "fa-user-friends", text: "2 adultes + 1 enfant" },
            { icon: "fa-bed", text: "1 lit pour 4 personnes" },
            { icon: "fa-bath", text: "1 salle de bain avec Jacuzzi" },
            { icon: "fa-credit-card", text: "Porte à carte" },
            { icon: "fa-umbrella-beach", text: "Terrasse" },
        ],
        details: [
            { label: "Superficie", value: "60 m²" },
            { label: "Lits", value: "1 lit pour 4 personnes" },
            { label: "Capacité", value: "3 personnes" },
            { label: "Vue", value: "Ville" },
            { label: "Porte", value: "Serrure intelligente" },
            { label: "Terrasse", value: "Oui" },
            { label: "Jacuzzi", value: "Oui" },
        ],
        facilities: [
            { icon: "fa-wifi", name: "Wi-Fi" },
            { icon: "fa-tv", name: "TV intelligente" },
            { icon: "fa-concierge-bell", name: "Service en chambre" },
            { icon: "fa-hot-tub", name: "Jacuzzi" },
            { icon: "fa-credit-card", name: "Porte à carte" },
            { icon: "fa-umbrella-beach", name: "Terrasse privée" },
        ],
        image: "/assets/images/rooms/suites/suite-307.jpg",
        images: [
            "/assets/images/rooms/suites/suite-307.jpg",
            "/assets/images/rooms/suites/suite-307-2.jpg",
            "/assets/images/rooms/suites/suite-307-3.jpg",
        ],
        link: "/room-details/suite-delux",
    },
    {
        name: "Suite Élégante",
        slug: "suite-elegante",
        title: "Suite Élégante",
        subtitle: "Séjour confortable et élégant",
        type: "Suite",
        guests: 3,
        size: "60 m²",
        price: "60000",
        default_curency: {
            code: "XOF",
            name: "Franc CFA",
            symbol: "FCFA",
            rateToEUR: 655.957
        },
        description: "Profitez d'une suite élégante avec tout le confort nécessaire pour un séjour agréable.",
        basicInfo: [
            { icon: "fa-user-friends", text: "2 adultes + 1 enfant" },
            { icon: "fa-bed", text: "1 lit pour 4 personnes" },
            { icon: "fa-bath", text: "1 salle de bain avec Jacuzzi" },
            { icon: "fa-credit-card", text: "Porte à carte" },
            { icon: "fa-umbrella-beach", text: "Terrasse" },
        ],
        details: [
            { label: "Superficie", value: "60 m²" },
            { label: "Lits", value: "1 lit pour 4 personnes" },
            { label: "Capacité", value: "3 personnes" },
            { label: "Vue", value: "Ville" },
            { label: "Porte", value: "Serrure intelligente" },
            { label: "Terrasse", value: "Oui" },
            { label: "Jacuzzi", value: "Oui" },
        ],
        facilities: [
            { icon: "fa-wifi", name: "Wi-Fi" },
            { icon: "fa-tv", name: "TV intelligente" },
            { icon: "fa-concierge-bell", name: "Service en chambre" },
            { icon: "fa-hot-tub", name: "Jacuzzi" },
            { icon: "fa-credit-card", name: "Porte à carte" },
            { icon: "fa-umbrella-beach", name: "Terrasse privée" },
        ],
        image: "/assets/images/rooms/suites/suite-407.jpg",
        images: [
            "/assets/images/rooms/suites/suite-407.jpg",
            "/assets/images/rooms/suites/suite-407-2.jpg",
            "/assets/images/rooms/suites/suite-407-3.jpg",
        ],
        link: "/room-details/suite-elegante",
    },
];



// roomsData.ts



// ---------- Config ----------
export const ROOM_TYPES: RoomType[] = [
    { value: "simple", label: "Chambre simple", hasClim: true, canHaveChildren: true },
    { value: "double", label: "Chambre double", hasClim: true, canHaveChildren: true },
    { value: "familiale", label: "Chambre familiale", hasClim: true, canHaveChildren: true },
    { value: "suite", label: "Suite", hasClim: true, canHaveChildren: true },
];

export const extrasList = [
    { name: "Blanchisserie", price: 5000 },
    { name: "Petit-déjeuner", price: 2500 },
    { name: "Déjeuner", price: 5000 },
    { name: "Dîner", price: 5000 },
    { name: "Pack Petit-déjeuner + Déjeuner + Dîner", price: 10000 },
    { name: "Piscine", price: 3000 },
    { name: "Salle de sport", price: 3000 },
];

// Données par défaut
export const defaultTestimonials: Testimonial[] = testimonials;
export const LOCAL_APP_API_KEY = process.env.LOCAL_APP_API_KEY || '';

export const currencies :  Currency[] = [
    {
        code: "XOF",
        name: "Franc CFA",
        symbol: "FCFA",
        rateToEUR: 655.957 // Taux de conversion fixe entre CFA et Euro
    },
    {
        code: "EUR",
        name: "Euro",
        symbol: "€",
        rateToEUR: 1 // Taux de conversion de l'Euro à l'Euro (évidemment)
    },
    {
        code: "USD",
        name: "Dollar américain",
        symbol: "$",
        rateToEUR: 1.08 // Taux de conversion fixe du Dollar à l'Euro
    }
];


export const legalPagesData: Record<string, LegalPageData> = {
    mentionsLegales: {
        title: "Mentions Légales",
        html_content: `
      <h2>Mentions Légales de l'Hôtel Le Pays</h2>
      <p><strong>Raison sociale :</strong> Hôtel Le Pays</p>
      <p><strong>Forme juridique :</strong> Société à Responsabilité Limitée (SARL)</p>
      <p><strong>Adresse du siège social :</strong> Sendou, Département de Rufisque, Région de Dakar, Sénégal</p>
      <p><strong>Directeur de publication :</strong> Luck Onobiono</p>
      <p><strong>Hébergeur :</strong> HostingCompany, Adresse complète de l'hébergeur (inclure l'adresse et le contact de l'hébergeur, conformément à la législation sénégalaise)</p>
      <p><strong>Contact :</strong> <a href="mailto:hotellepays@gmail.com">hotellepays@gmail.com</a></p>
      <p><strong>Numéro d’identification :</strong> (exemple : NINEA, ou un autre numéro d'enregistrement si applicable au Sénégal)</p>
      <p><strong>Propriété intellectuelle :</strong> Tous les contenus présents sur ce site, incluant mais sans s'y limiter, textes, images, logos, vidéos, et tout autre matériel sont la propriété exclusive de l'Hôtel Le Pays ou de ses partenaires. Toute reproduction, distribution ou utilisation non autorisée des contenus est interdite sans l'accord préalable de l’Hôtel Le Pays.</p>
      <p><strong>Protection des données personnelles :</strong> Conformément à la législation sénégalaise sur la protection des données personnelles, notamment la loi 2008-12 relative à la protection des données à caractère personnel, l’Hôtel Le Pays s'engage à protéger la confidentialité des informations collectées. Pour plus d’informations sur la collecte et l’utilisation de vos données personnelles, consultez notre <a href="/politique-de-confidentialite">Politique de confidentialité</a>.</p>
      <p><strong>Cookies :</strong> Ce site utilise des cookies pour améliorer l'expérience utilisateur. En continuant à naviguer sur ce site, vous acceptez l'utilisation de cookies conformément à notre <a href="/politique-de-confidentialite#cookies">Politique de Cookies</a>.</p>
    `,
        seo: {
            metaTitle: "Mentions Légales – Hôtel Le Pays",
            metaDescription:
                "Consultez les informations légales et les contacts de l'Hôtel Le Pays à Sendou, Sénégal, ainsi que nos engagements en matière de confidentialité et de protection des données.",
            keywords: ["mentions légales", "Hôtel Le Pays", "contact hôtel Sendou", "protection des données", "politique de confidentialité"],
        },
    },

    politiqueConfidentialite: {
        title: "Politique de Confidentialité",
        html_content: `
      <h2>Politique de Confidentialité</h2>
      <p>Chez l'Hôtel Le Pays, la protection de vos données personnelles est une priorité. Nous collectons et traitons vos données conformément à la législation sénégalaise sur la protection des données personnelles (Loi 2008-12) ainsi qu'au Règlement Général sur la Protection des Données (RGPD) pour les visiteurs européens.</p>
      <p>Les informations que vous nous fournissez sont utilisées exclusivement dans le cadre de la gestion de vos réservations, de l'amélioration de nos services, et de la communication avec vous pour des raisons liées à votre séjour ou à vos demandes.</p>
      <h3>Quelles données collectons-nous ?</h3>
      <p>Nous collectons les données suivantes : nom, prénom, adresse email, numéro de téléphone, dates de réservation, informations de paiement, et toute autre donnée nécessaire à la gestion de votre séjour. Ces données sont collectées lors de la réservation ou de l'enregistrement sur notre site.</p>
      <h3>Pourquoi collectons-nous ces données ?</h3>
      <p>Les données collectées sont utilisées pour :</p>
      <ul>
        <li>Gérer vos réservations et vous envoyer des confirmations et informations importantes concernant votre séjour.</li>
        <li>Améliorer la qualité de nos services et personnaliser votre expérience à l'Hôtel Le Pays.</li>
        <li>Respecter nos obligations légales, notamment celles liées à la facturation et à la gestion des paiements.</li>
        <li>Si vous avez donné votre consentement, vous envoyer des informations promotionnelles ou des offres spéciales.</li>
      </ul>
      <h3>Comment protégeons-nous vos données ?</h3>
      <p>Nous mettons en œuvre des mesures techniques et organisationnelles strictes pour protéger vos données personnelles contre tout accès, modification ou divulgation non autorisés. Seul le personnel autorisé et les partenaires de confiance peuvent accéder à vos informations dans le cadre de leurs fonctions spécifiques.</p>
      <h3>Vos droits</h3>
      <p>Conformément à la législation en vigueur, vous avez plusieurs droits concernant vos données personnelles :</p>
      <ul>
        <li><strong>Droit d'accès :</strong> Vous avez le droit de demander une copie des données personnelles que nous détenons à votre sujet.</li>
        <li><strong>Droit de rectification :</strong> Vous pouvez corriger ou mettre à jour vos informations personnelles si elles sont inexactes ou incomplètes.</li>
        <li><strong>Droit à l'oubli :</strong> Vous pouvez demander la suppression de vos données personnelles sous certaines conditions.</li>
        <li><strong>Droit d'opposition :</strong> Vous avez le droit de vous opposer au traitement de vos données personnelles à des fins de marketing direct.</li>
        <li><strong>Droit à la portabilité :</strong> Vous pouvez demander une copie de vos données dans un format structuré et lisible par machine.</li>
      </ul>
      <p>Si vous souhaitez exercer l'un de ces droits, vous pouvez nous contacter via <a href="mailto:hotellepays@gmail.com">hotellepays@gmail.com</a>.</p>
      <h3>Partage de vos données</h3>
      <p>Nous ne vendons ni ne louons vos données personnelles à des tiers. Cependant, dans certains cas, nous pouvons être amenés à partager vos informations avec des prestataires de services de confiance (ex. : services de paiement en ligne, hébergeurs, etc.), uniquement dans le cadre de la gestion de votre réservation ou de nos services.</p>
      <h3>Cookies</h3>
      <p>Notre site utilise des cookies pour améliorer votre expérience de navigation, analyser l'utilisation du site et personnaliser nos offres. Vous avez la possibilité de refuser les cookies via les paramètres de votre navigateur, mais cela pourrait limiter certaines fonctionnalités du site.</p>
      <p>Pour en savoir plus, consultez notre <a href="/politique-de-confidentialite#cookies">Politique de Cookies</a>.</p>
    `,
        seo: {
            metaTitle: "Politique de Confidentialité – Hôtel Le Pays",
            metaDescription:
                "Découvrez comment l'Hôtel Le Pays protège vos données personnelles et respecte votre vie privée en conformité avec la législation sénégalaise et le RGPD.",
            keywords: ["politique de confidentialité", "données personnelles", "RGPD", "protection des données", "cookies"],
        },
    },

    cgv: {
        title: "Conditions Générales de Vente",
        html_content: `
      <h2>Conditions Générales de Vente</h2>
      <p>Avant toute réservation, merci de lire attentivement nos conditions générales de vente :</p>
      <h3>1. Modalités de réservation et de paiement</h3>
      <p>Pour effectuer une réservation, vous devez remplir le formulaire de réservation en ligne et fournir des informations de paiement valides. Le paiement peut être effectué par carte bancaire, virement ou tout autre mode de paiement accepté par l'Hôtel Le Pays.</p>
      
      <h3>2. Politique d'annulation et de remboursement</h3>
      <p>Les annulations doivent être effectuées au moins 48 heures avant la date d'arrivée pour bénéficier d'un remboursement complet. Toute annulation effectuée après ce délai pourra entraîner des frais d'annulation correspondant à une nuitée. En cas de non-présentation, le montant total de la réservation sera facturé.</p>
      
      <h3>3. Tarifs et taxes</h3>
      <p>Les tarifs des chambres sont indiqués en FCFA et incluent toutes les taxes locales applicables. Des frais supplémentaires peuvent être appliqués pour des services additionnels tels que le room service, les services de spa, etc.</p>
      
      <h3>4. Responsabilité de l'hôtel et du client</h3>
      <p>L'Hôtel Le Pays ne saurait être tenu responsable des pertes, vols ou dommages survenant dans les chambres ou sur ses lieux. Le client est responsable de son comportement et de la bonne utilisation des équipements de l'hôtel. Toute dégradation des installations ou du mobilier pourra être facturée au client.</p>
    `,
        seo: {
            metaTitle: "Conditions Générales de Vente – Hôtel Le Pays",
            metaDescription:
                "Conditions générales pour la réservation, le paiement et l'annulation à l'Hôtel Le Pays à Sendou.",
            keywords: ["CGV", "conditions de réservation", "Hôtel Le Pays", "annulation", "tarifs"],
        },
    },

    cgu: {
        title: "Conditions Générales d'Utilisation",
        html_content: `
      <h2>Conditions Générales d'Utilisation</h2>
      <p>Ces conditions régissent l'utilisation du site web et du service de réservation en ligne de l'Hôtel Le Pays. En accédant et en utilisant ce site, vous acceptez sans réserve ces conditions d'utilisation.</p>
      
      <h3>1. Accès au site</h3>
      <p>Le site est accessible à toute personne disposant d'un accès à internet. L'Hôtel Le Pays se réserve le droit de suspendre l'accès au site pour des raisons techniques ou de maintenance.</p>
      
      <h3>2. Propriété intellectuelle</h3>
      <p>Les contenus du site, incluant textes, images, logos, et autres éléments, sont protégés par des droits de propriété intellectuelle. Toute reproduction, représentation, ou utilisation non autorisée des contenus est interdite sans l'accord préalable de l'Hôtel Le Pays.</p>
      
      <h3>3. Responsabilité</h3>
      <p>Bien que nous nous efforcions de maintenir le site accessible et à jour, l'Hôtel Le Pays ne garantit pas que le site soit exempt d'erreurs, de virus ou d'interruptions. L'utilisateur utilise le site à ses propres risques.</p>
      
      <h3>4. Protection des données personnelles</h3>
      <p>Conformément à la législation sur la protection des données personnelles, l'Hôtel Le Pays s'engage à ne collecter que les données nécessaires et à les traiter en toute confidentialité. Consultez notre <a href="/politique-de-confidentialite">Politique de Confidentialité</a> pour plus d'informations.</p>
    `,
        seo: {
            metaTitle: "CGU – Hôtel Le Pays",
            metaDescription:
                "Règles d'utilisation du site web et des services de réservation de l'Hôtel Le Pays à Sendou.",
            keywords: ["CGU", "utilisation site web", "réservation en ligne", "conditions d'utilisation", "protection des données"],
        },
    },

    politiqueCookies: {
        title: "Politique de Cookies",
        html_content: `
      <h2>Politique de Cookies</h2>
      <p>Notre site utilise des cookies pour améliorer votre expérience utilisateur, analyser le trafic et assurer le bon fonctionnement de nos services. Un cookie est un petit fichier de texte qui est enregistré sur votre appareil lorsque vous accédez à notre site.</p>
      
      <h3>1. Types de cookies utilisés</h3>
      <p>Nous utilisons plusieurs types de cookies :</p>
      <ul>
        <li><strong>Cookies fonctionnels :</strong> nécessaires au bon fonctionnement du site (ex. : préférences de langue, gestion de la session).</li>
        <li><strong>Cookies analytiques :</strong> utilisés pour analyser le trafic et améliorer nos services (ex. : Google Analytics).</li>
        <li><strong>Cookies de marketing :</strong> pour personnaliser les publicités et promotions affichées.</li>
      </ul>
      
      <h3>2. Gestion des cookies</h3>
      <p>Vous pouvez accepter ou refuser les cookies en modifiant les paramètres de votre navigateur. Veuillez noter que la désactivation de certains cookies peut affecter votre expérience sur notre site.</p>
      <p>Pour plus de détails sur l'utilisation des cookies, consultez notre <a href="/politique-de-confidentialite#cookies">Politique de Cookies</a>.</p>
    `,
        seo: {
            metaTitle: "Politique de Cookies – Hôtel Le Pays",
            metaDescription:
                "Explication détaillée sur l'utilisation des cookies sur le site de l'Hôtel Le Pays à Sendou.",
            keywords: ["cookies", "politique cookies", "Hôtel Le Pays", "utilisation cookies", "gestion cookies"],
        },
    },
};

const DEBUG = true; // 👉 passe à false pour désactiver

export const debugLog = (...args: any[]) => {
    if (DEBUG) {
        console.log(...args);
    }
};

export  const debugWarn = (...args: any[]) => {
    if (DEBUG) {
        console.warn(...args);
    }
};