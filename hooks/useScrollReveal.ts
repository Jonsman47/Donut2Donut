"use client";

import { useEffect, useRef, useState } from 'react';

export function useScrollReveal(threshold = 0.1) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<any>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    // Once visible, we can stop observing if we only want entrance animations
                    if (ref.current) observer.unobserve(ref.current);
                }
            },
            { threshold }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) observer.unobserve(ref.current);
        };
    }, [threshold]);

    return { ref, isVisible };
}
