import React from "react";
import { defaultRooms, Room } from "@/app/types/hotelData";

type RoomSectionProps = {
    rooms?: Room[];
};

const RoomSection: React.FC<RoomSectionProps> = ({ rooms = defaultRooms }) => {
    return (
        <div className="row">
            {rooms.map((room: Room, index: number) => (
                <div
                    key={index}
                    className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4"
                >
                    <div className="room-block-island">
                        <div className="inner-block">
                            {/* Image */}
                            <div className="image-box">
                                <img src={room.image} alt={room.title} />
                            </div>

                            {/* Content */}
                            <div className="content-box">
                                <ul className="feature-list">
                                    {/* Superficie */}
                                    {room.size && (
                                        <li>
                                            <i className="fa-light fa-arrow-up-right-from-square"></i>{" "}
                                            {room.size}
                                        </li>
                                    )}

                                    {/* Type de chambre */}
                                    {room.type && (
                                        <li>
                                            <i className="fa-light fa-hotel"></i> {room.type}
                                        </li>
                                    )}

                                    {/* Capacité */}
                                    {room.guests && (
                                        <li>
                                            <i className="fa-light fa-user-group"></i>{" "}
                                            {room.guests} personnes
                                        </li>
                                    )}
                                </ul>

                                {/* Titre */}
                                <h4 className="title">{room.title}</h4>

                                {/* Sous-titre */}
                                {room.subtitle && (
                                    <div className="category">{room.subtitle}</div>
                                )}
                            </div>

                            {/* CTA */}
                            <a href={room.link} className="btn-learn-more">
                                En savoir plus <i className="far fa-arrow-right"></i>
                            </a>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RoomSection;
