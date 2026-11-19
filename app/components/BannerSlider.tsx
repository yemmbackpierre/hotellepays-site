"use client";

import React, { useEffect, useRef } from "react";
import { sliderData } from "@/app/types/hotelData";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

type Slide = {
    title: string;
    description: string;
    image: string;
    buttonText: string;
    buttonLink: string;
    videoLink?: string;
};

const BannerSlider: React.FC = () => {
    const bannerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!bannerRef.current) return;

        gsap.registerPlugin(SplitText);

        // Sélectionne tous les titres avec la classe text-reveal-anim
        const titles = bannerRef.current.querySelectorAll(".banner-title.text-reveal-anim");

        titles.forEach((title) => {
            const split = new SplitText(title, { type: "words" }); // animation par mots
            gsap.from(split.words, {
                duration: 1,
                opacity: 0,
                y: 20,
                stagger: 0.2,
                ease: "power2.out",
            });
        });
    }, []);

    return (
        <section className="banner-area p-relative overflow-hidden" ref={bannerRef}>
            <div className="banner-wrapper p-relative">
                <Swiper
                    modules={[Navigation, Autoplay]}
                    navigation={{
                        nextEl: ".slider-next",
                        prevEl: ".slider-prev",
                    }}
                    autoplay={{ delay: 5000 }}
                    loop={true}
                    className="banner-active"
                >
                    {sliderData.map((slide: Slide, index: number) => (
                        <SwiperSlide key={index}>
                            <div className="banner-height">
                                <div
                                    className="banner-bg"
                                    style={{ backgroundImage: `url(${slide.image})` }}
                                ></div>
                                <div className="container">
                                    <div className="row align-items-center">
                                        <div className="col-xl-9">
                                            <div className="banner-content position-relative z-3">
                                                <div className="banner-title-box">
                                                    <div className="banner-star-rating">
                                                        {[...Array(3)].map((_, i) => (
                                                            <i
                                                                key={i}
                                                                className="fa-sharp fa-solid fa-star-sharp"
                                                            ></i>
                                                        ))}
                                                    </div>
                                                    <h1 className="banner-title text-reveal-anim">
                                                        {slide.title}
                                                    </h1>
                                                    <p className="banner-paragraph">{slide.description}</p>
                                                </div>
                                                <div className="banner-btn-box">
                                                    <a className="theme-btn-main" href={slide.buttonLink}>
                            <span className="theme-btn-arrow-left">
                              <img
                                  src="/assets/images/icons/button-arrow.svg"
                                  alt="arrow"
                              />
                            </span>
                                                        <span className="theme-btn">{slide.buttonText}</span>
                                                        <span className="theme-btn-arrow-right">
                              <img
                                  src="/assets/images/icons/button-arrow.svg"
                                  alt="arrow"
                              />
                            </span>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                        {slide.videoLink && (
                                            <div className="col-xl-3">
                                                <div className="banner-play-button position-relative z-2">
                                                    <a
                                                        className="play-now-two"
                                                        href={slide.videoLink}
                                                        data-fancybox="gallery"
                                                        data-caption=""
                                                    >
                                                        <i className="fa-solid fa-play"></i>
                                                        <span className="ripple"></span>
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                <div className="banner-arrow-box">
                    <button className="slider-prev">
                        <i className="fa-regular fa-arrow-left"></i>
                    </button>
                    <button className="slider-next">
                        <i className="fa-regular fa-arrow-right"></i>
                    </button>
                </div>

                <div className="common-heading-wrap text-center">
                    <h2 id="common-heading" className="common-heading">
                        Hôtel Le Pays
                    </h2>
                </div>
            </div>
        </section>
    );
};

export default BannerSlider;
