// /app/pages/politique-cookies.tsx
import React from "react";
import Breadcrumb from "@/app/layouts/Breadcrumb";
import {legalPagesData} from "@/app/types/hotelData";
import LegalPage from "@/app/components/legals/LegalPage";

export default function PolitiqueCookies() {
    const tpaths = [
        { name: "Accueil", link: "/" },
        { name: "Politique de Cookies" },
    ];

    return (
        <>
            <Breadcrumb
                paths={tpaths}
                title={legalPagesData.politiqueCookies.title}
                backgroundImage="/assets/images/resource/service-island1-3.jpg"
            />
            <LegalPage data={legalPagesData.politiqueCookies} />
        </>
    );
}