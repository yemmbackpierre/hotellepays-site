import Link from "next/link";
import { defaultFeatures, Feature } from "@/app/types/hotelData";

interface Props {
    features?: Feature[];
}

export default function ServiceSectionWinter({ features = defaultFeatures }: Props) {
    return (
        <section className="service-section-winter pt-120 pb-120 pt-md-80 pb-md-80">
            <div className="container">
                <div className="row g-4">
                    {features.slice(0, 3).map((feature, index) => {
                        const isMiddle = index === 1;

                        return (
                            <div key={index} className="col-lg-4">
                                {/* Image en haut (1 & 3) */}
                                {!isMiddle && (
                                    <figure className="image mb-4">
                                        <Link href="/services">
                                            <img
                                                src={feature.img_bg}
                                                alt={feature.title}
                                                width={500}
                                                height={350}
                                                className="img-fluid"
                                            />
                                        </Link>
                                    </figure>
                                )}

                                {/* Bloc service */}
                                <div className={`service-block-winter ${isMiddle ? "mb-4" : ""}`}>
                                    <div className="icon">
                                        <i className="flaticon-light"></i>
                                    </div>
                                    <div className="sub-icon">
                                        <i className="flaticon-light"></i>
                                    </div>

                                    <h4 className="title">
                                        <Link href="/services">{feature.title}</Link>
                                    </h4>

                                    <p
                                        className="text"
                                        dangerouslySetInnerHTML={{
                                            __html: feature.description.replace(". ", ".<br />"),
                                        }}
                                    />
                                </div>

                                {/* Image en bas (colonne centrale) */}
                                {isMiddle && (
                                    <figure className="image">
                                        <Link href="/services">
                                            <img
                                                src={feature.img_bg}
                                                alt={feature.title}
                                                width={500}
                                                height={350}
                                                className="img-fluid"
                                            />
                                        </Link>
                                    </figure>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}