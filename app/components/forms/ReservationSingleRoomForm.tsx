"use client";

import React, { useState } from "react";
import { BookingData, HotelData } from "@/app/types/hotelData";

type CheckoutFormProps = {
    hotel?: HotelData;
    price?: number;
    currencySymbol?: string;
};

const ReservationSingleRoomForm: React.FC<CheckoutFormProps> = ({ hotel, price = 0, currencySymbol = "€" }) => {
    const [formData, setFormData] = useState<BookingData>({
        checkIn: "",
        checkOut: "",
        rooms: "1 chambre",
    });

    const [selectedRooms, setSelectedRooms] = useState<number>(1);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === "rooms") {
            const n = Math.min(10, Math.max(1, parseInt(value, 10) || 1));
            setSelectedRooms(n);
            setFormData(prev => ({ ...prev, rooms: `${n} chambre${n > 1 ? "s" : ""}` }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const toDatetimeLocal = (input: string | Date) => {
        const d = typeof input === "string" ? new Date(input) : input;
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.checkIn || !formData.checkOut) {
            alert("Veuillez sélectionner vos dates.");
            return;
        }

        const arrival = encodeURIComponent(toDatetimeLocal(formData.checkIn));
        const departure = encodeURIComponent(toDatetimeLocal(formData.checkOut));
        const numRooms = selectedRooms;

        // Navigation vers la page booking
        window.location.assign(`/booking?arrival=${arrival}&departure=${departure}&numRooms=${numRooms}`);
    };

    return (
        <div className="kodelisting-room-booking mb-30">
            <div className="kodelisting-room-booking-wrap">
                <div className="room-booking-title d-flex align-items-end justify-content-between">
                    <h5 className="title">Reserve:</h5>
                    {price ? (
                        <span>
              From <span className="base-price">{currencySymbol}{price}</span>/night
            </span>
                    ) : null}
                </div>

                <form className="reservation-form" onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <input
                            type="datetime-local"
                            name="checkIn"
                            placeholder="Check In"
                            className="form-control"
                            value={formData.checkIn}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mb-3">
                        <input
                            type="datetime-local"
                            name="checkOut"
                            placeholder="Check Out"
                            className="form-control"
                            value={formData.checkOut}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mb-3">
                        <select
                            name="rooms"
                            className="form-select"
                            value={selectedRooms}
                            onChange={handleChange}
                        >
                            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                                <option key={n} value={n}>
                                    {n} chambre{n > 1 ? "s" : ""}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-3">
                        <button type="submit" className="theme-btn btn-style-one w-100">
                            Reserver Maintenant
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReservationSingleRoomForm;
