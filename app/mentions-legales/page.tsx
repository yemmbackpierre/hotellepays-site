// /app/pages/mentions-legales.tsx
import React from "react";
import Breadcrumb from "@/app/layouts/Breadcrumb";
import {legalPagesData} from "@/app/types/hotelData";
import LegalPage from "@/app/components/legals/LegalPage";

export default function Component() {
    const tpaths: { name: string; link?: string }[] = [
        { name: "Accueil", link: "/" },
        { name: "Mentions légales" },
    ];

    return (
        <>
            <Breadcrumb
                paths={tpaths}
                title={legalPagesData.mentionsLegales.title}
                backgroundImage="/assets/images/resource/service-island1-3.jpg"
            />

            <LegalPage data={legalPagesData.mentionsLegales} />
        </>
    );
}