"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { defaultPresentationRoms, Room } from "@/app/types/hotelData";

type ExtendedRoom = Room & { beds?: number[] };

type PresentationRomsSectionProps = {
    rooms?: ExtendedRoom[];
};

const PresentationRomsSection: React.FC<PresentationRomsSectionProps> = ({
    rooms = defaultPresentationRoms,
}) => {
    // Helper pour afficher la liste des lits (ou un fallback lisible)
    const renderBedsOrDetails = (room: ExtendedRoom) => {
        const icon = (
            <span>
                <img src="/assets/images/icons/destination-icon.svg" alt="icon" />
            </span>
        );

        if (room.beds && room.beds.length) {
            return room.beds.map((bed: number, i: number) => (
                <li key={`bed-${i}`}>
                    {icon}
                    {bed} Beds
                </li>
            ));
        }

        // Cherche une étiquette "Lits" dans details (si fournie par les données)
        const litsDetail = room.details?.find((d) => /lit/i.test(d.label));
        if (litsDetail) {
            return (
                <li key="lits-detail">
                    {icon}
                    {litsDetail.value}
                </li>
            );
        }

        // Fallback: affiche la capacité (guests)
        return (
            <li key="guests">
                {icon}
                {room.guests} Guests
            </li>
        );
    };

    return (
        <section className="destination-area">
            <div className="destination-heading-wrap text-center">
                <h2 className="gradient-title1">Confort</h2>
            </div>

            <div className="container">
                <div className="row">
                    <div className="col-xl-12">
                        <div
                            className="destination-slide-wrapper position-relative z-2"
                            data-aos="fade-up"
                            data-aos-duration="1000"
                            data-aos-delay="200"
                        >
                            <Swiper
                                modules={[Navigation, Pagination]}
                                navigation={{
                                    nextEl: ".slider-next",
                                    prevEl: ".slider-prev",
                                }}
                                pagination={{
                                    el: ".destination-dots",
                                    clickable: true,
                                }}
                                className="destination-active"
                            >
                                {rooms.map((room: ExtendedRoom, index: number) => (
                                    <SwiperSlide key={index}>
                                        <div
                                            className="destination-bg"
                                            style={{ backgroundImage: `url(${room.image})` }}
                                        >
                                            <div className="container">
                                                <div className="row align-items-end">
                                                    <div className="col-xl-6">
                                                        <div className="destination-wrapper">
                                                            <h2 className="destination-title text-reveal-anim">
                                                                {room.name}
                                                            </h2>

                                                            <div className="destination-wrap">
                                                                <ul>
                                                                    {renderBedsOrDetails(room)}

                                                                    {room.size && (
                                                                        <li>
                                      <span>
                                        <img
                                            src="/assets/images/icons/destination-icon.svg"
                                            alt="icon"
                                        />
                                      </span>
                                                                            {room.size}
                                                                        </li>
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>

                            {/* Navigation — IDENTIQUE AU BANNER */}
                            <div className="destination-arrow-box">
                                <button className="slider-prev">
                                    <i className="fa-regular fa-arrow-left"></i>
                                </button>
                                <button className="slider-next">
                                    <i className="fa-regular fa-arrow-right"></i>
                                </button>
                            </div>

                            {/* Pagination */}
                            <div className="destination-dots text-center"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PresentationRomsSection;
