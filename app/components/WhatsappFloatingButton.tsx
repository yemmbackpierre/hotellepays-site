"use client";

import React from "react";
import { defaultheaderData } from "@/app/types/hotelData";

const whatsappContact = defaultheaderData.contactInfo.find(
    (item) => item.type === "whatsapp"
);

const WHATSAPP_NUMBER = whatsappContact?.number || "";
const WHATSAPP_MESSAGE =
    "Bonjour, je souhaite avoir des informations sur votre hôtel.";

const WhatsappFloatingButton = () => {
    if (!WHATSAPP_NUMBER) return null; // sécurité

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        WHATSAPP_MESSAGE
    )}`;

    const handleClick = () => {
        // Google Analytics (GA4)
        if (typeof window !== "undefined" && (window as any).gtag) {
            (window as any).gtag("event", "whatsapp_click", {
                event_category: "engagement",
                event_label: "WhatsApp Floating Button",
            });
        }

        // Meta / Facebook Pixel
        if (typeof window !== "undefined" && (window as any).fbq) {
            (window as any).fbq("track", "Contact");
        }

        window.open(whatsappUrl, "_blank");
    };

    return (
        <button className="whatsapp-float" onClick={handleClick}>
            <i className="fab fa-whatsapp"></i>
        </button>
    );
};

export default WhatsappFloatingButton;
