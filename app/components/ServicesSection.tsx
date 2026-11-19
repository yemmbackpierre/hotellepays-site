import React from "react";
import {Service, serviceData} from "@/app/types/hotelData";

const ServicesSection: React.FC = () => {
    return (
        <section className="service-section-resort pt-120 pb-120 px-5">
            <div className="row g-4">
                {serviceData.map((service: Service, index: number) => (
                    <div key={index} className="col-lg-3">
                        <div className="service-block-resort tp_fade_bottom">
                            <div className="icon">
                                <i className={service.iconClass}></i>
                            </div>
                            <h3 className="title">{service.title}</h3>
                            {service.description && <p className="text">{service.description}</p>}
                            {service.link && (
                                <a href={service.link} className="more-btn">
                                    More Details <i className="fa-light fa-arrow-up-right"></i>
                                </a>
                            )}
                            {service.image && (
                                <div className="image">
                                    <img src={service.image} alt={service.title} />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ServicesSection;
