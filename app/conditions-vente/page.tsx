// /app/pages/conditions-vente.tsx
import React from "react";
import Breadcrumb from "@/app/layouts/Breadcrumb";
import {legalPagesData} from "@/app/types/hotelData";
import LegalPage from "@/app/components/legals/LegalPage";

export default function Component() {
    const tpaths = [
        { name: "Accueil", link: "/" },
        { name: "Conditions Générales de Vente" },
    ];

    return (
        <>
            <Breadcrumb
                paths={tpaths}
                title={legalPagesData.cgv.title}
                backgroundImage="/assets/images/resource/service-island1-3.jpg"
            />
            <LegalPage data={legalPagesData.cgv} />
        </>
    );
}