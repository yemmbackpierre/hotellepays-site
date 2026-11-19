"use client";

import React, { useState } from "react";
import Link from "next/link";
import { defaultRooms, defaultPresentationRoms, defaultSuites } from "@/app/types/hotelData";
import ReservationSingleRoomForm from "@/app/components/forms/ReservationSingleRoomForm";

type Room = typeof defaultRooms[number];

type RoomDetailsProps = {
    roomSlug: string;
};

const getIconClass = (icon?: string) => {
    if (!icon) return "";
    if (icon.startsWith("fa-")) return `fas ${icon}`;
    return icon;
};

const RoomDetails: React.FC<RoomDetailsProps> = ({ roomSlug }) => {

    const allRooms: Room[] = [...defaultRooms, ...defaultPresentationRoms, ...defaultSuites];
    const room = allRooms.find(r => r.slug === roomSlug);

    const [currentImage, setCurrentImage] = useState(0);

    if (!room) {
        return (
            <div className="container" style={{ padding: "100px 20px", textAlign: "center" }}>
                <h3>Désolé, cette chambre est introuvable.</h3>
                <Link href="/" className="btn btn-primary mt-3">
                    Retour à l'accueil
                </Link>
            </div>
        );
    }

    const images = room.images || [];
    const hasImages = images.length > 0;

    const safeSetImage = (idx: number) => {
        const clamped = Math.max(0, Math.min(idx, images.length - 1));
        setCurrentImage(clamped);
    };

    return (
        <section className="blog-details pt-120 pb-120">
            <div className="container">
                <div className="row">

                    {/* Contenu principal */}
                    <div className="col-xl-8 col-lg-7 product-details rd-page">

                        <div className="room-heading">
                            <h3 className="title mb-4">{room.title || room.name}</h3>
                            <div className="text">{room.subtitle}</div>

                            <ul className="kodelisting-room-basic-info g-3">
                                {(room.basicInfo || []).map((info, idx) => (
                                    <li key={idx}>
                                        <i className={`${getIconClass(info.icon)} me-2`}></i>
                                        <span className="csrbi-text">{info.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Slider images */}
                        <div className="mt-30">
                            <figure className="image-box">
                                <img
                                    src={hasImages ? images[currentImage] : room.image}
                                    alt={room.title ?? room.name}
                                    style={{
                                        width: "100%",
                                        borderRadius: "8px",
                                        objectFit: "cover",
                                        maxHeight: "500px"
                                    }}
                                />
                            </figure>

                            {hasImages && (
                                <ul className="thumb-box d-flex flex-wrap gap-2 list-unstyled mt-3">
                                    {images.map((img, idx) => (
                                        <li key={idx}>
                                            <button
                                                type="button"
                                                onClick={() => safeSetImage(idx)}
                                                style={{
                                                    border: currentImage === idx
                                                        ? "2px solid #D4A373"
                                                        : "2px solid transparent",
                                                    padding: 0,
                                                    cursor: "pointer",
                                                    borderRadius: "4px",
                                                    overflow: "hidden"
                                                }}
                                            >
                                                <img
                                                    src={img}
                                                    width="80"
                                                    height="60"
                                                    style={{ objectFit: "cover" }}
                                                />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Description */}
                        <div className="wrapper mt-40">

                            <h3>Description de la chambre</h3>
                            <p className="text">{room.description}</p>

                            <div className="room-details__details-box mt-20 mb-40">
                                <div className="row">
                                    {(room.details || []).map((detail, idx) => (
                                        <div key={idx} className="col-6 col-md-3">
                                            <p style={{ fontSize: "0.9rem", color: "#777" }}>
                                                {detail.label}
                                            </p>
                                            <h6 style={{ fontWeight: 600 }}>
                                                {detail.value}
                                            </h6>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Équipements */}
                            <h4>Équipements & Services</h4>

                            <div className="row room-facility-list mb-40">
                                {(room.facilities || []).map((facility, idx) => (
                                    <div key={idx} className="col-sm-6 col-xl-4">
                                        <div className="list-one d-flex align-items-center mb-3">
                                            <div className="icon text-theme-color1 me-2">
                                                <i className={getIconClass(facility.icon)}></i>
                                            </div>
                                            <h6 className="title m-0">
                                                {facility.name}
                                            </h6>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-xl-4 col-lg-5">
                        <div className="sidebar">

                            <ReservationSingleRoomForm />

                            <div className="sidebar__single sidebar__post">
                                <h3 className="sidebar__title">Autres Chambres</h3>

                                <ul className="list-unstyled">

                                    {allRooms
                                        .filter(r => r.slug !== room.slug)
                                        .slice(0, 3)
                                        .map(r => (

                                            <li key={r.slug} className="mb-3">

                                                <Link
                                                    href={`/room-details/${r.slug}`}
                                                    className="d-flex align-items-center"
                                                    style={{ textDecoration: "none", color: "inherit" }}
                                                >

                                                    <div style={{
                                                        width: 80,
                                                        height: 60,
                                                        marginRight: 15,
                                                        flexShrink: 0
                                                    }}>
                                                        <img
                                                            src={r.image}
                                                            alt={r.title}
                                                            style={{
                                                                width: "100%",
                                                                height: "100%",
                                                                borderRadius: 4,
                                                                objectFit: "cover"
                                                            }}
                                                        />
                                                    </div>

                                                    <div>
                                                        <span style={{
                                                            fontSize: "0.8rem",
                                                            color: "#D4A373"
                                                        }}>
                                                            <i className="fas fa-door-open me-1"></i>
                                                            {r.title}
                                                        </span>

                                                        <div style={{ fontWeight: "bold" }}>
                                                            {r.price}€ / Nuit
                                                        </div>
                                                    </div>

                                                </Link>

                                            </li>

                                        ))}

                                </ul>

                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default RoomDetails;