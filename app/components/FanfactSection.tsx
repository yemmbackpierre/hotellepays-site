import React from "react";
import {Fanfact, fanfactsData} from "@/app/types/hotelData";

const FanfactSection: React.FC = () => {
    return (
        <section className="fanfact-section pt-200 pb-200">
            <div className="outer-box">
                <div className="row g-4 g-xl-0">
                    {fanfactsData.map((item: Fanfact, index: number) => (
                        <div key={index} className="col-md-6 col-xl-3">
                            <div className="fanfact-block" data-speed=".9">
                                <h3 className="title count-box">
                                    <span className="count-text" data-stop={item.count} data-speed="2000"></span>
                                    {item.suffix}
                                </h3>
                                <span className="sub-title">{item.title}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FanfactSection;




