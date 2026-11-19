import type { NextConfig } from "next";

const nextConfig = {
    output: 'export', // génère les fichiers HTML/CSS/JS statiques
    // Optionnel : pour générer des dossiers avec index.html
    trailingSlash: true,
};

export default nextConfig;
