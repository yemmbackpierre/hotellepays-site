"use client"; // obligatoire car on utilise useState, useEffect et window

import React, { useState, useEffect } from "react";

export default function Preloader() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simule le chargement, ou tu peux utiliser un vrai événement onLoad
        const timer = setTimeout(() => setLoading(false), 2000); // 2s
        return () => clearTimeout(timer);
    }, []);

    if (!loading) return null; // cache le preloader

    return (
        <div className="preloader">
            <svg viewBox="0 0 1000 1000" preserveAspectRatio="none">
                <path id="preloaderSvg" d="M0,1005S175,995,500,995s500,5,500,5V0H0Z"></path>
            </svg>
            <div className="preloader-heading">
                <div className="load-text">
                    <span>H</span>
                    <span>o</span>
                    <span>T</span>
                    <span>E</span>
                    <span>L</span>
                    <span>&nbsp;</span>
                    <span>L</span>
                    <span>E</span>
                    <span>P</span>
                    <span>A</span>
                    <span>Y</span>
                    <span>S</span>
                </div>
            </div>
        </div>
    );
}
