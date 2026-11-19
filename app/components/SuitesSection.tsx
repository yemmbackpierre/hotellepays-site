"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { defaultSuites, Suite } from "@/app/types/hotelData";

type SuitesSectionProps = {
    suites?: Suite[];
};

const SuitesSection: React.FC<SuitesSectionProps> = ({ suites = defaultSuites }) => {
    return (
        <section className="suite-area position-relative z-1">
            <div className="container-fluid gx-0">
                <div className="row">
                    <div className="col-xl-12">
                        <div
                            className="suite-slide-wrapper position-relative z-2"
                            data-aos="fade-up"
                            data-aos-duration="1000"
                            data-aos-delay="200"
                        >
                            <Swiper
                                modules={[Navigation, Pagination]}
                                navigation={{
                                    nextEl: ".slider-next",
                                    prevEl: ".slider-prev",
                                }}
                                pagination={{
                                    el: ".suite-dots",
                                    clickable: true,
                                }}
                                className="suite-active"
                                slidesPerView={1}
                                // Observer pour que Swiper se recalibre si layout change
                                observer={true}
                                observeParents={true}
                            >
                                {suites.map((suite, index) => (
                                    <SwiperSlide key={suite.slug || `suite-${index}`}>
                                        <div className="container-fluid">
                                            <div className="row align-items-center gx-0">
                                                {/* IMAGE */}
                                                <div className="col-xl-6">
                                                    <div className="suite-bg">
                                                        <img
                                                            className="w-100"
                                                            src={suite.image}
                                                            alt={suite.name}
                                                            loading="lazy"
                                                        />
                                                        <div className="suite-tag">
                                                            <span>{suite.type}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* CONTENU */}
                                                <div className="col-xl-6">
                                                    <div className="suite-wrapper">
                                                        <div className="suite-wrap">
                                                            <div className="suite-heading-wrap position-relative z-1">
                                                                <h2 className="common-heading">Suite</h2>
                                                                <div className="heading-shape">
                                                                    <img
                                                                        src="/assets/images/suite/suite-heading-shape.png"
                                                                        alt="suite"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <h4 className="title text-reveal-anim">
                                                                {suite.name}
                                                            </h4>

                                                            <div className="d-flex gap-3 flex-wrap mb-50">
                                                                <div className="item">
                                                                    <div className="text">
                                                                        <span>
                                                                            <img
                                                                                src="/assets/images/icons/user.svg"
                                                                                alt="user"
                                                                            />
                                                                        </span>{" "}
                                                                        {suite.guests} personne{suite.guests > 1 ? "s" : ""}
                                                                    </div>
                                                                </div>
                                                                <div className="item">
                                                                    <div className="text">
                                                                        <span>
                                                                            <img
                                                                                src="/assets/images/icons/feet.svg"
                                                                                alt="size"
                                                                            />
                                                                        </span>{" "}
                                                                        {suite.size}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <p className="text2">{suite.description}</p>

                                                            <div className="bottom-wrap">
                                                                <div className="suite-price">
                                                                    <p className="text">À </p>
                                                                    <h6 className="subtitle">{suite.price}</h6>
                                                                </div>

                                                                <div className="suite-button">
                                                                    <a
                                                                        className="theme-btn-main"
                                                                        href={suite.link}
                                                                    >
                                                                        <span className="theme-btn-arrow-left theme-bg theme-color-white">
                                                                            <img
                                                                                className="filter-white"
                                                                                src="/assets/images/icons/button-arrow.svg"
                                                                                alt="arrow"
                                                                            />
                                                                        </span>
                                                                        <span className="theme-btn theme-bg theme-color-white">
                                                                            Voir Détails
                                                                        </span>
                                                                        <span className="theme-btn-arrow-right theme-bg theme-color-white">
                                                                            <img
                                                                                className="filter-white"
                                                                                src="/assets/images/icons/button-arrow.svg"
                                                                                alt="arrow"
                                                                            />
                                                                        </span>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>

                            {/* NAVIGATION */}
                            <div className="arrow-box">
                                <button className="slider-prev" aria-label="Précédent">
                                    <i className="fa-regular fa-arrow-left"></i>
                                </button>
                                <button className="slider-next" aria-label="Suivant">
                                    <i className="fa-regular fa-arrow-right"></i>
                                </button>
                            </div>

                            {/* PAGINATION */}
                            <div className="suite-dots text-center" />
                        </div>
                    </div>
                </div>
            </div>

            {/* BACKGROUND SHAPE */}
            <div className="bg-shape">
                <img
                    className="suite-bg-shape-1"
                    src="/assets/images/gallery/gallery-bg-shape.png"
                    alt="shape"
                />
            </div>
        </section>
    );
};

export default SuitesSection;
