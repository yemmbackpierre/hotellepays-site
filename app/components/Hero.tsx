// components/Hero.tsx
import Slider from "@/app/components/Slider";
import BannerVideo from "@/app/components/BannerVideo";
import BannerImage from "@/app/components/BannerImage";
import { defaultHeroData } from "@/app/types/hotelData";

const Hero = () => {
    const data = defaultHeroData; // utilise uniquement les données internes

    return (
        <section className="hero-section relative">
            {/* Image unique */}
            {data.type === "image" && data.images && data.images.length > 0 && (
                <BannerImage  />
            )}

            {/* Slider */}
            {data.type === "slider" && data.images && data.images.length > 0 && (
                <Slider />
            )}

            {/* Vidéo */}
            {data.type === "video" && data.videoUrl && (
                <BannerVideo  />
            )}
        </section>
    );
};

export default Hero;
