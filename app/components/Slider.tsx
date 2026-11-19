import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import {slidesData} from "@/app/types/hotelData";



const Slider: React.FC = () => {
    return (
        <section className="banner-area p-relative overflow-hidden">
            <div className="banner-wrapper p-relative">
                <Swiper
                    modules={[Navigation]}
                    navigation={{
                        nextEl: ".slider-next",
                        prevEl: ".slider-prev",
                    }}
                    className="banner-active"
                >
                    {slidesData.map((slide, idx) => (
                        <SwiperSlide key={idx}>
                            <div className="banner-height">
                                <div
                                    className="banner-bg"
                                    style={{ backgroundImage: `url(${slide.background})` }}
                                ></div>
                                <div className="container">
                                    <div className="row align-items-center">
                                        <div className="col-xl-9">
                                            <div className="banner-content position-relative z-3">
                                                <div className="banner-title-box">
                                                    <div className="banner-star-rating">
                                                        {Array.from({ length: slide.stars || 0 }).map((_, i) => (
                                                            <i
                                                                key={i}
                                                                className="fa-sharp fa-solid fa-star-sharp"
                                                            ></i>
                                                        ))}
                                                    </div>
                                                    <h1 className="banner-title text-reveal-anim">{slide.title}</h1>
                                                    <p className="banner-paragraph">{slide.description}</p>
                                                </div>
                                                <div className="banner-btn-box">
                                                    <a className="theme-btn-main" href={slide.buttonLink}>
                            <span className="theme-btn-arrow-left">
                              <img src="assets/images/icons/button-arrow.svg" alt="arrow" />
                            </span>
                                                        <span className="theme-btn">{slide.buttonText}</span>
                                                        <span className="theme-btn-arrow-right">
                              <img src="assets/images/icons/button-arrow.svg" alt="arrow" />
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

                {/* Navigation buttons */}
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

export default Slider;
