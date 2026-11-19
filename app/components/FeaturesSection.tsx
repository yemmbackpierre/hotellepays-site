import React from "react";
import {defaultFeatures, Feature} from "@/app/types/hotelData";


type FeaturesSectionProps = {
    features?: Feature[];
    sectionTitle?: string;
};


const FeaturesSection: React.FC<FeaturesSectionProps> = ({ features = defaultFeatures, sectionTitle = "Équipements & Services" }) => {
    return (
        <section className="feature-area position-relative z-1">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-xl-8">
                        <div className="section-wrapper text-center mb-50">
                            <h2 className="section-title text-reveal-anim">{sectionTitle}</h2>
                        </div>
                    </div>
                </div>

                <div className="row">
                    {features.map((feature, idx) => (
                        <div key={idx} className="col-xl-4 col-lg-6">
                            <div className="feature-box" data-aos="fade-up" data-aos-duration="1000" data-aos-delay={300 + idx * 100}>
                                <div className="thumb">
                                    <img src={feature.image} alt={feature.title} />
                                </div>
                                <div className="content-box">
                                    <h4 className="title">{feature.title}</h4>
                                    <p className="text">{feature.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="row justify-content-center">
                    <div className="col-xl-6">
                        <div className="feature-bottom text-center">
                            <p>Ces services populaires rendent votre séjour encore plus agréable !</p>
                            <div className="button">
                                <a href="/rooms-suites">
                                    Voir toutes les chambres <span><i className="fa-regular fa-arrow-right"></i></span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="feature-bg-shape">
                <img className="feature-bg-shape-birds" src="/assets/images/feature/feature-bg-shape-birds.png" alt="shape" />
            </div>
        </section>
    );
};

export default FeaturesSection;
