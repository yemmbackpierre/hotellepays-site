// /app/components/LegalPage.tsx
import React from "react";
import Head from "next/head";
import {LegalPageData} from "@/app/types/hotelData";

type LegalPageProps = {
    data: LegalPageData;
};

const LegalPage: React.FC<LegalPageProps> = ({ data }) => {
    return (
        <>
            {data.seo && (
                <Head>
                    <title>{data.seo.metaTitle}</title>
                    <meta name="description" content={data.seo.metaDescription} />
                    <meta name="keywords" content={data.seo.keywords?.join(", ")} />
                </Head>
            )}

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