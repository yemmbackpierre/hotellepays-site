// /app/components/LegalPage.tsx
import React from "react";
import {LegalPageData} from "@/app/types/hotelData";

type LegalPageProps = {
    data: LegalPageData;
};

const LegalPage: React.FC<LegalPageProps> = ({ data }) => {
    return (
        <>
            <section className="legal-page container mt-60">
                <h1>{data.title}</h1>
                <div
                    className="legal-page-content"
                    dangerouslySetInnerHTML={{ __html: data.html_content ?? "" }}
                />
            </section>
        </>
    );
};

export default LegalPage;