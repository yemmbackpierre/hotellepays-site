"use client";

import { useState } from "react";
import {FAQ, FAQData} from "@/app/types/hotelData";

interface Props {
    faqs?: FAQ[];
}

export default function FAQSection({ faqs = FAQData }: Props) {
    const [activeIndex, setActiveIndex] = useState<number | null>(0);

    const toggleFAQ = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    // découpe en 2 colonnes
    const mid = Math.ceil(faqs.length / 2);
    const leftFaqs = faqs.slice(0, mid);
    const rightFaqs = faqs.slice(mid);

    return (
        <section className="faqs-section-home1 mt-0 pt-120 pb-100 pb-md-20">
            <div className="auto-container">
                <div className="row">
                    {/* Colonne gauche */}
                    <div className="faq-column col-lg-6">
                        <div className="inner-column">
                            <ul className="accordion-box style-two">
                                {leftFaqs.map((faq, index) => {
                                    const isActive = activeIndex === index;

                                    return (
                                        <li
                                            key={index}
                                            className={`accordion block ${
                                                isActive ? "active-block" : ""
                                            }`}
                                        >
                                            <div
                                                className={`acc-btn ${
                                                    isActive ? "active" : ""
                                                }`}
                                                style={{
                                                    color: "var(--theme-color-black)",
                                                    fontSize: "18px",
                                                }}
                                                onClick={() => toggleFAQ(index)}
                                            >
                                                {faq.question}
                                                <div className="icon fa fa-plus"></div>
                                            </div>

                                            {isActive && (
                                                <div className="acc-content current">
                                                    <div className="content">
                                                        <div className="text">{faq.answer}</div>
                                                    </div>
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>

                    {/* Colonne droite */}
                    <div className="faq-column col-lg-6">
                        <div className="inner-column mb-md-50">
                            <ul className="accordion-box style-two bg-transparent p-0">
                                {rightFaqs.map((faq, index) => {
                                    const realIndex = index + mid;
                                    const isActive = activeIndex === realIndex;

                                    return (
                                        <li
                                            key={realIndex}
                                            className={`accordion block pl-30 pr-30 ${
                                                isActive ? "active-block" : ""
                                            }`}
                                        >
                                            <div
                                                className={`acc-btn border-bottom-0 ${
                                                    isActive ? "active" : ""
                                                }`}
                                                style={{
                                                    color: "var(--theme-color-black)",
                                                    fontSize: "18px",
                                                }}
                                                onClick={() => toggleFAQ(realIndex)}
                                            >
                                                {faq.question}
                                                <div className="icon fa fa-plus"></div>
                                            </div>

                                            {isActive && (
                                                <div className="acc-content current">
                                                    <div className="content border-bottom-0 pt-0">
                                                        <div className="text">{faq.answer}</div>
                                                    </div>
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
