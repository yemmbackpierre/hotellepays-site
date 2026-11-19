// components/Error404.js
import Image from "next/image";
import Link from "next/link";

const Error404 = ({
  hotel = {
    name: "Hôtel Le Pays",
    description:
      "Hôtel 3 étoiles situé à Sendou, un établissement confortable pour ne pas être dépaysé ayant un service de qualité",
    image: "/assets/images/resource/404.jpg", // chemin dans /public
  },
  pageTitle = "Page not found!",
  pageText = "Sorry, we can't find that page! The page you are looking for was never existed.",
  searchPlaceholder = "Search here",
  homeButtonText = "Back to Home",
}) => {
  return (
    <section className="error-section">
      <div className="auto-container pt-120 pb-70">
        <div className="row">
          <div className="col-xl-12">
            <div className="error-page__inner">
              <div className="error-page__title-box">
                <Image
                  src={hotel.image}
                  alt={hotel.name}
                  width={600}
                  height={400}
                  className="error-image"
                />
                <h3 className="error-page__sub-title">{pageTitle}</h3>
              </div>
              <p className="error-page__text">
                {pageText.replace("{hotel}", hotel.name)}
              </p>
              <form className="error-page__form">
                <div className="error-page__form-input">
                  <input type="search" placeholder={searchPlaceholder} />
                  <button type="submit">
                    <i className="lnr lnr-icon-magnifier"></i>
                  </button>
                </div>
              </form>
              <Link href="/" className="theme-btn btn-style-one shop-now">
                <span className="btn-title">{homeButtonText}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Error404;
