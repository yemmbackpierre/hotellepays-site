"use client";

import React from "react";
import { motion } from "framer-motion";
import { Pricing, Pricings } from "@/app/types/hotelData";

type PricingSectionProps = {
    pricings?: Pricing[];
};

const PricingSection: React.FC<PricingSectionProps> = ({ pricings = Pricings }) => {
    return (
        <section className="pricing-section-four">
            <div className="auto-container">
                <div className="row">
                    {pricings.map((room: Pricing, index: number) => (
                        <motion.div
                            key={room.title} // clé unique recommandée plutôt que index
                            className="pricing-block-four col-md-6 col-lg-4"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <div className="inner-box">
                                <div className="content-column">
                                    <div className="inner-column">
                                        <span className="pricing-title">{room.title}</span>
                                        <h6 className="pricing-amount">
                                            <sup>{room.currency || "$"}</sup>
                                            {room.price} <span>{room.per}</span>
                                        </h6>
                                        <ul className="list-style-two">
                                            {room.features.map((feature, i) => (
                                                <li key={i}>
                                                    <i className="icon fa fa-circle-check"></i> {feature}
                                                </li>
                                            ))}
                                        </ul>
                                        <a href={room.link} className="book-now btn-style-four">
                                            Réserver
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
