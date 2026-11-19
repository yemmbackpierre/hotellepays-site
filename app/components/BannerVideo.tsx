import Image from "next/image";
import {BannerVideoData, defaultBannerVideoData} from "@/app/types/hotelData";


type Props = {
  data?: BannerVideoData;
};


const BannerVideo = ({ data = defaultBannerVideoData }: Props) => {
  const hero = { ...defaultBannerVideoData, ...data };

  return (
    <section className="hero-section hero-1-mountain fix">
      <div className="container">
        <div className="row g-4 justify-content-between">
          {/* Texte gauche */}
          <div className="col-xl-7">
            <div className="hero-content">
              <h1 className="title">
                <span className="line">
                  <Image
                    src="/assets/images/mountain/line.png"
                    alt="line"
                    width={100}
                    height={20}
                  />
                </span>
                <span className="color">{hero.highlight}</span> <br />
                {hero.titleLines.map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </h1>
              <div className="hero-button">
                <a href={hero.buttonLink} className="theme-btn-eight d-grid">
                  <span className="royle-btn__text d-flex justify-content-between">
                    {hero.buttonText} <i className="lnr-icon-arrow-right"></i>
                  </span>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`royle-btn__hover royle-btn__hover--${i + 1}`}></span>
                  ))}
                </a>
              </div>
            </div>
          </div>

          {/* Vidéo droite */}
          <div className="col-xl-5">
            <div className="hero-items">
              <div className="hero-image banner-section-3__video pinned-3">
                <video
                  className="video"
                  src={hero.videoSrc}
                  poster={hero.videoPoster}
                  muted
                  autoPlay
                  loop
                  playsInline
                />
              </div>
              <div className="text">{hero.description}</div>
            </div>
          </div>
        </div>

        {/* Scroll down */}
        <div id="scrollDown" className="scroll-down">
          <div className="arrow-icon">
            <i className="lnr-icon-arrow-down"></i>
          </div>
          <p>{hero.scrollText}</p>
        </div>
      </div>
    </section>
  );
};

export default BannerVideo;
