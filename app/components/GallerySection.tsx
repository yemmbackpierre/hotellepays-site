import React from "react";
import {defaultImages} from "@/app/types/hotelData";

type GalleryProps = {
    images?: string[];
};

const GallerySection: React.FC<GalleryProps> = ({ images = defaultImages }) => {
    return (
        <div className="gallery-area text-center">
            <div className="gallery-thumb-wrap position-relative">
                {images.slice(0, -1).map((img, idx) => (
                    <div key={idx} className={`gallery-thumb-inner-${idx + 1} d-none d-xl-block`}>
                        <img src={img} alt={`Galerie ${idx + 1}`} />
                    </div>
                ))}
                <div className="gallery-thumb">
                    <img src={images[images.length - 1]} alt="Galerie principale" />
                </div>
            </div>
        </div>
    );
};

export default GallerySection;
