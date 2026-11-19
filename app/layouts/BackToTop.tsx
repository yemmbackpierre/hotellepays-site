"use client";

import React, { useEffect, useState } from "react";

export default function BackToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) setVisible(true);
            else setVisible(false);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div
            className={`fixed right-6 md:right-10 transition-all duration-300 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"
            }`}
            style={{ bottom: "120px", zIndex: 1000 }}
        >
            <button
                onClick={scrollToTop}
                className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-blue-600 text-white shadow-xl hover:scale-110 transform transition-transform focus:outline-none focus:ring-4 focus:ring-teal-300"
                aria-label="Retour en haut"
            >
                {/* SVG personnalisé : flèche stylisée */}
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M12 4L4 12H9V20H15V12H20L12 4Z"
                        fill="white"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
        </div>
    );
}
