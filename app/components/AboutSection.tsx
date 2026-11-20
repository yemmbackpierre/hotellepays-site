import React from "react";
import { AboutData, defaultAboutData } from "@/app/types/hotelData";

type AboutProps = {
    data?: AboutData;
    page?: "home" | "about";
};

const AboutSection: React.FC<AboutProps> = ({ data, page = "home" }) => {
    const aboutInfo = { ...defaultAboutData, ...data };
    const isHome = page === "home";
    const isAbout = page === "about";

    return (
        <>
            <section className="about-area position-relative z-1">
                <div className="container">
                    <div className="row align-items-center">
                        {/* Images à gauche */}
                        <div className="col-xl-7">
                            <div className="about-left">
                                <div className="about-left-thumb">
                                    <div className="image mb-30 wow img-custom-anim-left">
                                        <img
                                            src={aboutInfo.images?.[0] ?? "/assets/images/about/default1.jpg"}
                                            alt="Hôtel Le Pays Sendou Sénégal"
                                        />
                                    </div>
                                    <div className="image wow img-custom-anim-left">
                                        <img
                                            src={aboutInfo.images?.[1] ?? "/assets/images/about/default2.jpg"}
                                            alt="Chambres Hôtel Le Pays"
                                        />
                                    </div>
                                </div>
                                <div className="image wow img-custom-anim-right">
                                    <img
                                        src={aboutInfo.images?.[2] ?? "/assets/images/about/about-royal.jpg"}
                                        alt="Piscine Hôtel Le Pays Sendou"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Texte */}
                        <div className="col-xl-5">
                            <div
                                className="about-wrapper"
                                data-aos="fade-up"
                                data-aos-duration="1000"
                                data-aos-delay="400"
                            >
                                <div className="section-wrapper">
                                    <h2 className="section-title text-reveal-anim">{aboutInfo.title}</h2>

                                    {/* Description courte */}
                                    {isHome && (
                                        <p className="section-paragraph">{aboutInfo.description}</p>
                                    )}
                                </div>

                                {/* Liste des features */}
                                <div className="about-list">
                                    <ul>
                                        {aboutInfo.features?.map((feature, idx) => (
                                            <li key={idx}>
                        <span>
                          <img
                              src="/assets/images/icons/about-list-icon.svg"
                              alt="hotel services icon"
                          />
                        </span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Bouton */}
                                {isHome && (
                                    <div className="about-button">
                                        <a className="theme-btn-main" href={aboutInfo.buttonLink}>
                      <span className="theme-btn-arrow-left theme-bg theme-color-white">
                        <img
                            className="filter-white"
                            src="/assets/images/icons/button-arrow.svg"
                            alt="arrow"
                        />
                      </span>
                                            <span className="theme-btn theme-bg theme-color-white">
                        {aboutInfo.buttonText}
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
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Background shape */}
                <div className="about-bg-shape">
                    <img
                        className="about-bg-shape-1"
                        src="assets/images/about/about-bg-shape.png"
                        alt="shape"
                    />
                </div>

                {/* Description longue avec image à droite */}
                {isAbout && (
                    <div className="container">
                        <div className="row align-items-center">
                            {/* Texte */}
                            <div className="col-xl-7">
                                <div className="about-left">
                                    <div className="blog-details__content container mt-60">

                                        {/* Description HTML avec fallback pour éviter TS2322 */}
                                        <div
                                            className="about-long-description"
                                            dangerouslySetInnerHTML={{__html: aboutInfo.html_description ?? ""}}
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* Images à gauche */}
                            <div className="col-xl-5">
                                <div className="about-right">
                                    <div className="image wow img-custom-anim-right">
                                        <img
                                            src={aboutInfo.html_description_image ?? "/assets/images/about/about-royal.jpg"}
                                            alt="Batiment de l'Hôtel Le Pays Sendou"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </>
    );
};

export default AboutSection;