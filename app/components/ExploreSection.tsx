"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { defaultExplore, ExploreItem } from "@/app/types/hotelData";
import { TextRevealWrapper } from "@/app/components/TextRevealWrapper";

type ExploreSectionProps = {
    items?: ExploreItem[];
    title?: string;
};

const ExploreSection: React.FC<ExploreSectionProps> = ({
                                                           items = defaultExplore,
                                                           title = "Hôtels et Villas à Explorer",
                                                       }) => {
    return (
        <TextRevealWrapper>
            <section className="explore-area overflow-hidden">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-xl-8">
                            <div className="section-wrapper text-center mb-50">
                                <h2 className="section-title text-reveal-anim">{title}</h2>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-xl-12">
                            <div
                                className="explore-slide-wrapper position-relative z-2"
                                data-aos="fade-up"
                                data-aos-duration="1000"
                                data-aos-delay="200"
                            >
                                <Swiper
                                    modules={[Navigation, Pagination, Autoplay]}
                                    slidesPerView={3} // <-- 3 slides visibles
                                    spaceBetween={30} // espace entre slides
                                    loop={true} // boucle infinie
                                    autoplay={{ delay: 4000, disableOnInteraction: false }} // carrousel automatique
                                    navigation // flèches automatiques
                                    pagination={{ clickable: true }}
                                    className="explore-active swiper-container"
                                >
                                    {items.map((item, idx) => (
                                        <SwiperSlide key={idx} className="swiper-slide">
                                            <div className="explore-box">
                                                <div className="image-box">
                                                    <img className="w-100" src={item.image} alt={item.name} />
                                                    {item.tag && (
                                                        <div className="tag">
                                                            <a href={item.link}>{item.tag}</a>
                                                        </div>
                                                    )}
                                                    <div className="button">
                                                        <a href={item.link}>
                                                            <img src="/assets/images/icons/explore-button.svg" alt="button" />
                                                        </a>
                                                    </div>
                                                    <div className="content-box">
                                                        <div className="top-area">
                                                            <div className="d-flex align-items-center gap-3 mb-1">
                                                                <div className="rating">
                                                                    {Array.from({ length: item.rating }).map((_, i) => (
                                                                        <i key={i} className="fa-sharp fa-solid fa-star-sharp"></i>
                                                                    ))}
                                                                </div>
                                                                <h6 className="review-text mb-0">
                                                                    {item.rating} ({item.reviews} avis)
                                                                </h6>
                                                            </div>
                                                            <h4 className="title text-reveal-anim">
                                                                <a href={item.link}>{item.name}</a>
                                                            </h4>
                                                        </div>
                                                        <div className="content-bottom">
                                                            <div className="content-list">
                                                                <ul>
                                                                    {item.features.map((feature, i) => (
                                                                        <li key={i}>
                                      <span>
                                        <img
                                            src={`/assets/images/icons/explore-icon${i + 1}.svg`}
                                            alt="icon"
                                        />
                                      </span>
                                                                            {feature}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>

                                {/* Pagination */}
                                <div className="pagination text-center"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="explore-shape">
                    <img className="shape-1" src="/assets/images/explore/explore-shape1.png" alt="shape" />
                    <img className="shape-2" src="/assets/images/explore/explore-shape2.png" alt="shape" />
                </div>
            </section>
        </TextRevealWrapper>
    );
};

export default ExploreSection;
