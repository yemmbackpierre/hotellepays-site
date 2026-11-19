import React from 'react';
import Breadcrumb from "@/app/layouts/Breadcrumb";
import BackToTop from "@/app/layouts/BackToTop";
import PricingSection from "@/app/components/PricingSection";
import TestimonialSection from "@/app/components/TestimonialSection";

interface ErrorPageProps {
    message?: string; // Paramètre texte avec valeur par défaut
}

const ErrorPage: React.FC<ErrorPageProps> = ({ message = "Désolé, nous ne trouvons pas cette page ! La page que vous recherchez n'a jamais existé." }) => {
    const tpaths: { name: string; link?: string; }[]=[
        { name: 'Accueil', link: '/' },
        { name: 'Reservation', link:  '/booking' },
    ];

    return (
        <>

            <Breadcrumb paths={tpaths} title={message}
                        backgroundImage={'/assets/images/resource/4041.jpg'}/>

            <section className="">
                <div className="auto-container pt-120 pb-70">
                    <div className="row">
                        <div className="col-xl-12">
                            <div className="error-page__inner">
                                <div className="error-page__title-box">
                                    <img src="/assets/images/resource/404.jpg" alt="404 Error"/>
                                    <h3 className="error-page__sub-title"> Hôtel Le Pays, hôtel 3 étoiles situé à Sendou, confortable et avec un service de qualité</h3>
                                </div>
                                <p className="error-page__text">
                                    Page not found!
                                </p>
                                <form className="error-page__form">
                                    <div className="error-page__form-input">
                                        <input type="search" placeholder="Search here"/>
                                        <button type="submit"><i className="lnr lnr-icon-magnifier"></i></button>
                                    </div>
                                </form>
                                <a href="/" className="theme-btn btn-style-one shop-now">
                                    <span className="btn-title">Back to Home</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ErrorPage;