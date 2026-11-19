
// components/BannerImage.tsx
import Image from "next/image";
import { useState } from "react";
import {defaultImageBannerData,  ImageBanner} from "@/app/types/hotelData";
import {FaPlay} from "react-icons/fa";


type BannerSliderProps = {
    slides?: ImageBanner[];
};


const BannerImage = ({ slides = defaultImageBannerData }: BannerSliderProps) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <section className="banner-area-island relative">
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`banner-slide absolute w-full h-full transition-opacity duration-700 ${
                        index === currentSlide ? "opacity-100" : "opacity-0"
                    }`}
                >
                    <div className="banner-bg absolute w-full h-full">
                        <Image
                            src={slide.bgImage}
                            alt={`Slide ${index + 1}`}
                            layout="fill"
                            objectFit="cover"
                            priority
                        />
                    </div>

                    <div className="outer-box relative z-10 flex justify-end items-center h-full">
                        <div className="banner-content max-w-xl p-8">
                            {slide.image && slide.videoUrl && (
                                <div className="video-box mb-4 relative">
                                    <Image
                                        src={slide.image}
                                        alt="Video Thumbnail"
                                        width={400}
                                        height={250}
                                        className="rounded"
                                    />
                                    <a
                                        href={slide.videoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="play-now-two absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-3xl"
                                    >
                                        <FaPlay />
                                    </a>
                                </div>
                            )}
                            {slide.text && <div className="text mb-4">{slide.text}</div>}
                            {slide.buttonText && slide.buttonLink && (
                                <a
                                    href={slide.buttonLink}
                                    className="theme-btn-nine relative inline-block px-6 py-3 bg-blue-600 text-white rounded"
                                >
                                    {slide.buttonText}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {/* Navigation simple */}
            {slides.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-5 top-1/2 -translate-y-1/2 z-20 text-white text-3xl"
                    >
                        ‹
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-5 top-1/2 -translate-y-1/2 z-20 text-white text-3xl"
                    >
                        ›
                    </button>
                </>
            )}
        </section>
    );
};

export default BannerImage;
