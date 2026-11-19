"use client";

import React, { useEffect, useRef, ReactNode } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

type TextRevealWrapperProps = {
    children: ReactNode;
};

export const TextRevealWrapper: React.FC<TextRevealWrapperProps> = ({ children }) => {
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!wrapperRef.current) return;

        gsap.registerPlugin(SplitText);

        // Sélectionne tous les titres avec la classe text-reveal-anim
        const titles = wrapperRef.current.querySelectorAll<HTMLElement>(".text-reveal-anim");

        titles.forEach((title) => {
            const split = new SplitText(title, { type: "words" });
            gsap.from(split.words, {
                duration: 1,
                opacity: 0,
                y: 20,
                stagger: 0.1,
                ease: "power2.out",
            });
        });
    }, []);

    return <div ref={wrapperRef}>{children}</div>;
};
