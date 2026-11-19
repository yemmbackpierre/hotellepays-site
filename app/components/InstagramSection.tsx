import React from "react";
import {instagramFeed} from "@/app/types/hotelData";

const InstagramSection: React.FC = () => {
    return (
        <section className="instragram-area">
            <div className="container-fluid gx-4">
                <div className="row gx-3">
                    {instagramFeed.map((item, index) => (
                        <div
                            className="col-xl-2 col-lg-4 col-sm-6"
                            key={index}
                            data-aos="fade-up"
                            data-aos-duration="1000"
                            data-aos-delay={200 + index * 100} // animation progressive
                        >
                            <div className="instragram-wrapper">
                                <div className="instragram-thumb">
                                    <img src={item.image} alt={`Instagram ${index + 1}`} />
                                    <div className="instragram-button">
                                        <a href={item.link}>
                                            <i className="fa-brands fa-instagram"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default InstagramSection;
