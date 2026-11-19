"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import {defaultTestimonials, Testimonial} from "@/app/types/hotelData";


type TestimonialSectionProps = {
    testimonials?: Testimonial[];
    title?: string;
};

const TestimonialSection: React.FC<TestimonialSectionProps> = ({
                                                                   testimonials = defaultTestimonials,
                                                                   title = "Avis de nos clients",
                                                               }) => {
    return (
        <section className="testimonial-section-one">
            <div className="container-fluid gx-0">
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
                            className="testimonial-slide-wrapper position-relative z-2"
                            data-aos="fade-up"
                            data-aos-duration="1000"
                            data-aos-delay="200"
                        >
                            <Swiper
                                modules={[Navigation, Pagination]}
                                navigation
                                pagination={{ clickable: true }}
                                className="testimonial-active"
                            >
                                {testimonials.map((t, idx) => (
                                    <SwiperSlide key={idx}>
                                        <div className="testimonial-block-one">
                                            <div className="testimonial-thumb position-relative z-1">
                                                <img src={t.thumb} alt={t.name} />
                                                {t.videoUrl && (
                                                    <div className="banner-play-button play-button">
                                                        <a
                                                            className="play-now-two"
                                                            href={t.videoUrl}
                                                            data-fancybox="gallery"
                                                            data-caption=""
                                                        >
                                                            <i className="fa-solid fa-play"></i>
                                                            <span className="ripple"></span>
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="content-box">
                                                <div className="review">
                                                    {Array.from({ length: t.rating }).map((_, i) => (
                                                        <i key={i} className="fa-sharp fa-solid fa-star-sharp"></i>
                                                    ))}
                                                </div>
                                                <div className="testimonial-content">
                                                    <p className="text">{t.text}</p>
                                                    <div className="author-info">
                                                        <div className="testimonial-bio-img">
                                                            <img src={t.image} alt={t.name} />
                                                        </div>
                                                        <div className="testimonial-bio-content">
                                                            <h6 className="author">{t.name}</h6>
                                                            <p className="desigation">{t.role}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                            <div className="testi-dot text-center"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TestimonialSection;
