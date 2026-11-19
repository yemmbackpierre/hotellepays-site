"use client";

import React from "react";
import "swiper/css";
import "swiper/css/navigation";

import { defaultDestinations } from "@/app/types/hotelData";

const DestinationSection: React.FC = () => {
    return (
        <section className="service-section-resort section-padding">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-xl-8">
                        <div className="section-wrapper text-center mb-50">
                            <h2 className="section-title text-reveal-anim">
                                Nous vous accompagnons
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="row g-4">
                    {defaultDestinations.map((destination) => (
                        <div
                            key={destination.slug}
                            className="col-lg-6 col-xl-4 col-xxl-3"
                        >
                            <div className="service-block-resort tp_fade_bottom">
                                {/* Miniature image (remplace l'icône) */}
                                <div className="icon">
                                    <img
                                        src={destination.images?.[0] || destination.image}
                                        alt={destination.name}
                                        style={{
                                            width: "60px",
                                            height: "60px",
                                            objectFit: "cover",
                                            borderRadius: "50%", // rond (retire si tu veux carré)
                                        }}
                                    />
                                </div>

                                <h3 className="title">{destination.name}</h3>

                                <p className="text">
                                    {destination.description.length > 120
                                        ? destination.description.slice(0, 120) + "..."
                                        : destination.description}
                                </p>

                                <a href={destination.link} className="more-btn">
                                    Voir les détails{" "}
                                    <i className="fa-light fa-arrow-up-right"></i>
                                </a>

                                {/* Image principale (fond du bloc) */}
                                <div className="image">
                                <img
                                        src={destination.image}
                                        alt={destination.name}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

    );
};

export default DestinationSection;
